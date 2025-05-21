import ConnectDB from "@/config/ConnectDB";
import NotificationsModel, { INotificationType } from "@/models/NotificationsModel";
import SlotModel, { IRegisterStatus } from "@/models/SlotModel";
import cron from "node-cron";
import { triggerSocketEvent } from "../socket/triggerSocketEvent";
import { SocketTriggerTypes } from "../constants";
import UserModel from "@/models/UserModel";
import { emailAuthentication } from "@/config/NodeEmailer";
import { DateTime } from "luxon";
import { handleCreateVideoCallDirectly } from "../server/handleCreateVideoCallDirectly";
import { handleDeleteVideoCallDirectly } from "../server/handleDeleteVideoCallDirectly";
import getNotificationExpiryDate from "../server/getNotificationExpiryDate";

declare global {
    // Extend the globalThis interface to include slotStatusCronStarted
    // eslint-disable-next-line no-var
    var slotStatusCronStarted: boolean | undefined;
}
globalThis.slotStatusCronStarted = globalThis.slotStatusCronStarted || false;

// Parse 12-hour time to 24-hour
function parseTimeTo24Hour(timeStr: string): { hours: number; minutes: number } | null {
    try {
        if (!timeStr) throw new Error("Invalid time string");

        let hours = 0, minutes = 0;
        const [time, modifier] = timeStr.trim().split(" ");
        // eslint-disable-next-line prefer-const
        let [h, m] = time.split(":").map(Number);

        if (modifier === "PM" && h !== 12) h += 12;
        if (modifier === "AM" && h === 12) h = 0;

        hours = h;
        minutes = m;

        if (isNaN(hours) || isNaN(minutes)) throw new Error("Invalid time format");

        return { hours, minutes };
    } catch (error) {
        console.error("[parseTimeTo24Hour Error]:", (error as Error).message);
        return null;
    }
}

export async function updateSlotStatuses() {
    try {
        console.log("START updateSlotStatuses:", new Date());

        await ConnectDB();
        const nowUTC = DateTime.utc();

        const slots = await SlotModel.find({
            status: { $in: [IRegisterStatus.Upcoming, IRegisterStatus.Ongoing] },
        });

        if (!slots.length) {
            console.log("No slots found for status update.\n");
            return;
        }

        for (const slot of slots) {
            if (!slot.meetingDate || !slot.durationFrom || !slot.durationTo) {
                console.warn(`Slot ID ${slot._id} missing time data.`);
                continue;
            }

            const user = await UserModel.findById(slot.ownerId).select("timeZone image email username");
            const timeZone = user?.timeZone?.replace("UTC", "UTC") || "UTC";

            const fromTime = parseTimeTo24Hour(slot.durationFrom);
            const toTime = parseTimeTo24Hour(slot.durationTo);

            if (!fromTime || !toTime) {
                console.warn(`Slot ${slot._id}: Failed to parse from/to time.`);
                continue;
            }

            const dateStr = DateTime.fromJSDate(slot.meetingDate).toISODate();

            // Convert to user's local time zone first, then to UTC
            const start = DateTime.fromISO(`${dateStr}T${String(fromTime.hours).padStart(2, '0')}:${String(fromTime.minutes).padStart(2, '0')}:00`, {
                zone: timeZone,
            }).toUTC();

            let end = DateTime.fromISO(`${dateStr}T${String(toTime.hours).padStart(2, '0')}:${String(toTime.minutes).padStart(2, '0')}:00`, {
                zone: timeZone,
            }).toUTC();

            if (end <= start) {
                end = end.plus({ days: 1 }); // handle overnight meetings
            }

            const timeDiffMinutes = Math.floor(start.diff(nowUTC, "minutes").minutes);
            const timeDiffHours = Math.floor(timeDiffMinutes / 60);
            const timeDiffDays = Math.floor(timeDiffHours / 24);

            // Reminder conditions
            if (slot.status === IRegisterStatus.Upcoming && timeDiffDays <= 1) {
                const shouldSend =
                    (timeDiffDays === 1 && timeDiffHours % 24 === 0 && timeDiffMinutes % 60 === 0) ||
                    (timeDiffDays === 0 && timeDiffHours === 3 && timeDiffMinutes % 60 === 0) ||
                    (timeDiffDays === 0 && timeDiffHours === 0 && timeDiffMinutes === 5);

                if (shouldSend) {
                    const lastSent = slot.lastReminderSentAt ? DateTime.fromJSDate(slot.lastReminderSentAt) : null;
                    const lastSentDiff = lastSent ? nowUTC.diff(lastSent, "seconds").seconds : Infinity;

                    if (lastSentDiff > 60) {
                        const subject = `Reminder: Your meeting "${slot.title}" is coming up!`;
                        const html = `
                            <p>Hi ${user?.username || 'there'},</p>
                            <p>This is a reminder that your meeting "<strong>${slot.title}</strong>" is scheduled at <strong>${slot.durationFrom}</strong> on <strong>${dateStr}</strong>.</p>
                            <p>Thank you!</p>
                        `;
                        if (user?.email) {
                            await emailAuthentication(user.email, subject, html);
                            slot.lastReminderSentAt = new Date();
                            await slot.save();
                            console.log(`Reminder sent to ${user.email} for slot ${slot._id}`);
                        }
                    }
                }
            }

            // Status update logic
            let newStatus = slot.status;

            if (nowUTC < start) {
                newStatus = IRegisterStatus.Upcoming;
            } else if (nowUTC >= start && nowUTC <= end) {
                newStatus = IRegisterStatus.Ongoing;
            } else if (nowUTC > end) {
                newStatus = slot.engagementRate === 0 ? IRegisterStatus.Expired : IRegisterStatus.Completed;
            }

            if (slot.status !== newStatus) {
                slot.status = newStatus;
                await slot.save();
                console.log(`Slot ${slot._id} updated to ${newStatus}`);

                if (newStatus === IRegisterStatus.Ongoing) {
                    const notification = {
                        type: INotificationType.MEETING_TIME_STARTED,
                        sender: slot.ownerId,
                        receiver: slot.ownerId,
                        slot: slot._id,
                        message: `*** It's time to Start your Meeting ***`,
                        isRead: false,
                        isClicked: false,
                        createdAt: new Date(),
                        expiresAt: getNotificationExpiryDate(30),
                    };

                    const saved = await new NotificationsModel(notification).save();

                    triggerSocketEvent({
                        userId: slot.ownerId.toString(),
                        type: SocketTriggerTypes.MEETING_TIME_STARTED,
                        notificationData: {
                            ...notification,
                            _id: saved._id,
                            image: user?.image,
                        },
                    });

                    await handleCreateVideoCallDirectly(slot._id, slot.ownerId.toString());
                }

                if (newStatus === IRegisterStatus.Completed) {
                    await handleDeleteVideoCallDirectly(slot._id);
                }
            } else {
                await slot.save(); // Still persist reminder timestamp if changed
            }
        }

        console.log(`END updateSlotStatuses: ${new Date()}\n`);
    } catch (error) {
        console.error("[updateSlotStatuses Error]:", (error as Error).message);
    }
}

// Run this every minute
let isRunning = false;

// Ensure the DB connection is established before starting the cron job
async function startCronJob() {
    if (globalThis.slotStatusCronStarted) {
        console.log("Cron job already started. Skipping initialization.");
        return;
    }

    cron.schedule("* * * * *", async () => {
        if (isRunning) return;
        isRunning = true;
        console.log("\nCron job running for slot status update");
        try {
            await updateSlotStatuses();
        } catch (e) {
            console.error(e);
        } finally {
            isRunning = false;
        }
    });

    globalThis.slotStatusCronStarted = true;

}

startCronJob(); 