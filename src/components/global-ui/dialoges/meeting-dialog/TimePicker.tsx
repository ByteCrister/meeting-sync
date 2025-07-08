'use client';

import { Input } from '@/components/ui/input'
import { setSlotFiledValues } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useEffect, useState } from 'react'
import ShowToaster from '../../toastify-toaster/show-toaster';

interface BusyTime {
    from: string;
    to: string;
}

const getCurrentTime24 = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const convertTo24Hour = (time: string) => {
    if (!time) return null;

    // If time is already in 24-hour format, like "20:08"
    if (/^\d{2}:\d{2}$/.test(time)) {
        return time;
    }

    // If time is in 12-hour format like "08:30 PM"
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
        console.warn("Unrecognized time format:", time);
        return "00:00"; // fallback
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, hour, min, period] = match;
    let h = parseInt(hour, 10);
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${min}`;
};

const convertTo12Hour = (time: string): string => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
};


const isTimeRangeAvailable = (from: string, to: string, busyTimes: BusyTime[]): boolean => {
    if (busyTimes.length === 0) return true;

    const from24 = convertTo24Hour(from);
    const to24 = convertTo24Hour(to);

    if (!from24 || !to24) {
        console.warn("Invalid from/to time provided:", from, to);
        return false;
    }

    const start = new Date(`1970-01-01T${from24}`).getTime();
    let end = new Date(`1970-01-01T${to24}`).getTime();

    // Handle cross-midnight time
    if (end <= start) {
        end += 24 * 60 * 60 * 1000; // Add 24 hours to end time
    }

    const selectedDuration = end - start;
    let overlapDuration = 0;

    for (const { from: busyFrom, to: busyTo } of busyTimes) {
        const busyFrom24 = convertTo24Hour(busyFrom);
        const busyTo24 = convertTo24Hour(busyTo);

        if (!busyFrom24 || !busyTo24) {
            console.warn("Invalid busy time slot:", busyFrom, busyTo);
            continue;
        }

        const busyStart = new Date(`1970-01-01T${busyFrom24}`).getTime();
        let busyEnd = new Date(`1970-01-01T${busyTo24}`).getTime();

        // Handle cross-midnight busy time
        if (busyEnd <= busyStart) {
            busyEnd += 24 * 60 * 60 * 1000;
        }

        // console.log(`Checking overlap: Selected [${from} - ${to}] vs Busy [${busyFrom} - ${busyTo}]`);

        const overlapStart = Math.max(start, busyStart);
        const overlapEnd = Math.min(end, busyEnd);

        if (overlapStart < overlapEnd) {
            overlapDuration += overlapEnd - overlapStart;
        }
    }

    // console.log(`Selected Duration: ${selectedDuration} ms, Overlap Duration: ${overlapDuration} ms`);
    return overlapDuration < selectedDuration;
};


const TimePicker = () => {
    const MeetingSlots = useAppSelector(state => state.slotStore.Store);

    const { slotDialog } = useAppSelector((state) => state.componentStore);
    const dispatch = useAppDispatch();

    const isReadOnly = slotDialog.mode === 'view';

    const [busyTimes, setBusyTimes] = useState<BusyTime[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, keyField: string) => {
        const inputRawTime = e.target.value;

        const meetingDate = slotDialog.slotField.meetingDate;
        if (!meetingDate) {
            ShowToaster("Please select a meeting date first.", "warning");
            return;
        }

        let inputTime = inputRawTime;

        // Convert to 12-hour format for internal state
        if (/^\d{2}:\d{2}$/.test(inputTime)) {
            inputTime = convertTo12Hour(inputTime);
        }

        const currentSlot = {
            ...slotDialog.slotField,
            [keyField]: inputTime,
        };

        const fromTime24 = convertTo24Hour(currentSlot.durationFrom);
        const toTime24 = convertTo24Hour(currentSlot.durationTo);

        // Validation: durationTo can't be selected before durationFrom
        if (keyField === "durationTo" && !currentSlot.durationFrom) {
            ShowToaster("Please select 'From' time before choosing 'To' time.", "warning");
            return;
        }

        // Validation: durationFrom must be earlier than durationTo
        if (fromTime24 && toTime24 && keyField === "durationTo") {
            const fromTime = new Date(`1970-01-01T${fromTime24}`);
            const toTime = new Date(`1970-01-01T${toTime24}`);

            let adjustedToTime = toTime;

            // If 'to' is less than or equal to 'from', assume it's on the next day
            if (toTime <= fromTime) {
                adjustedToTime = new Date(toTime.getTime() + 24 * 60 * 60 * 1000);
            }

            if (fromTime >= adjustedToTime) {
                ShowToaster("'To' time must be later than 'From' time.", "warning");
                return;
            }
        }

        // Validation: time range should be available
        if (keyField === "durationTo" && currentSlot.durationFrom && inputTime) {
            const isAvailable = isTimeRangeAvailable(
                currentSlot.durationFrom,
                inputTime,
                busyTimes
            );

            if (!isAvailable) {
                ShowToaster("Selected time is completely busy. Please choose another slot.", "warning");
                return;
            }
        }

        dispatch(setSlotFiledValues(currentSlot));
    };


    useEffect(() => {
        const selectedDate = slotDialog.slotField.meetingDate;
        if (!selectedDate) return;

        const selectedSlotsOfThisDate = MeetingSlots
            .filter(slot => slot._id !== slotDialog.slotField._id)
            .filter(slot => {
                const a = new Date(slot.meetingDate!);
                const b = new Date(selectedDate);
                return (
                    a.getUTCFullYear() === b.getUTCFullYear() &&
                    a.getUTCMonth() === b.getUTCMonth() &&
                    a.getUTCDate() === b.getUTCDate()
                );
            }).map(slot => ({ from: slot.durationFrom, to: slot.durationTo }));

        // console.log("Selected Slots of This Date:", selectedSlotsOfThisDate);
        setBusyTimes(selectedSlotsOfThisDate);

    }, [MeetingSlots, slotDialog.slotField._id, slotDialog.slotField.meetingDate]);


    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Select Time</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="fromTime" className="text-xs font-medium text-gray-600 mb-1">From</label>
                    <Input
                        id="fromTime"
                        type="time"
                        value={convertTo24Hour(slotDialog.slotField.durationFrom) || getCurrentTime24()}
                        readOnly={isReadOnly}
                        onChange={(e) => handleChange(e, "durationFrom")}
                        disabled={!slotDialog.slotField.meetingDate}
                        placeholder="HH:MM"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="toTime" className="text-xs font-medium text-gray-600 mb-1">To</label>
                    <Input
                        id="toTime"
                        type="time"
                        value={convertTo24Hour(slotDialog.slotField.durationTo) || getCurrentTime24()}
                        readOnly={isReadOnly}
                        onChange={(e) => handleChange(e, "durationTo")}
                        disabled={!slotDialog.slotField.durationFrom || !slotDialog.slotField.meetingDate}
                        placeholder="HH:MM"
                    />
                </div>
            </div>
        </div>
    )
};

export default TimePicker