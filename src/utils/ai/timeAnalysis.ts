"use server"

import { TimeDataSlot } from "@/app/api/ai-insights/best-time/route";

const parseTime = (timeStr: string) => {
    if (!timeStr) {
        throw new Error(`Invalid time string: ${timeStr}`);
    }

    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    // eslint-disable-next-line prefer-const
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes);  // Dummy date, time only
};

export const analyzeBestTimes = async (slots: TimeDataSlot[]) => {
    const days: Record<string, { engagementRates: number[], durations: number[], date: Date }> = {};

    slots.forEach(slot => {
        const date = new Date(slot.meetingDate);
        const day = date.toLocaleString('en-US', { weekday: 'long' });

        if (!days[day]) {
            days[day] = { engagementRates: [], durations: [], date };
        }

        const rate = Number(slot.engagementRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            console.warn(`Invalid engagementRate: ${slot.engagementRate} for slot on ${day}`);
            return; // skip invalid engagementRate
        }

        if (slot.durationFrom && slot.durationTo) {
            try {
                const startTime = parseTime(slot.durationFrom);
                let endTime = parseTime(slot.durationTo);

                // Fix for overnight meetings crossing midnight:
                if (endTime <= startTime) {
                    endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // add 24 hours
                }

                const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);  // Minutes

                days[day].engagementRates.push(rate);
                days[day].durations.push(duration || 0);
            } catch (error) {
                console.error("Error parsing time:", error);
            }
        } else {
            console.warn("Invalid time data for slot:", slot);
        }
    });

    return Object.entries(days).map(([day, { engagementRates, durations, date }]) => ({
        day,
        date,
        avgEngagement: engagementRates.length > 0
            ? engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length
            : 0,
        totalMeetings: engagementRates.length,
        avgDuration: durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
};
