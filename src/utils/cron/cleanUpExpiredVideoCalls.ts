import VideoCallModel from "@/models/VideoCallModel";
import SlotModel from "@/models/SlotModel";
import UserModel from "@/models/UserModel";
import { DateTime } from "luxon";
import ConnectDB from "@/config/ConnectDB";
import { handleDeleteVideoCallDirectly } from "../server/handleDeleteVideoCallDirectly";
import { updateTrendScoreForSlot } from "../server/updateTrendScoreForSlot";

export async function cleanupExpiredVideoCalls() {
    try {
        await ConnectDB();
    } catch (connErr) {
        console.error("[cleanupExpiredVideoCalls] DB connection failed:", connErr);
        return;
    }

    const nowUTC = DateTime.utc();

    let videoCalls;
    try {
        videoCalls = await VideoCallModel.find();
    } catch (err) {
        console.error("[cleanupExpiredVideoCalls] Failed to fetch video calls:", err);
        return;
    }

    for (const call of videoCalls) {
        try {
            const slot = await SlotModel.findById(call.meetingId);
            if (!slot) {
                console.warn(`[cleanupExpiredVideoCalls] Slot not found for call ${call._id}. Deleting orphaned video call.`);
                await VideoCallModel.deleteOne({ _id: call._id });
                continue;
            }

            const user = await UserModel.findById(slot.ownerId).select("timeZone");
            const timeZone = user?.timeZone?.replace("UTC", "") || "+00:00";

            const dateStr = DateTime.fromJSDate(slot.meetingDate).toISODate();

            const parse12HrTime = (timeStr: string) => {
                const [time, modifier] = timeStr.trim().split(" ");
                // eslint-disable-next-line prefer-const
                let [hours, minutes] = time.split(":").map(Number);
                if (modifier === "PM" && hours !== 12) hours += 12;
                if (modifier === "AM" && hours === 12) hours = 0;
                return { hours, minutes };
            };

            const from = parse12HrTime(slot.durationFrom);
            const to = parse12HrTime(slot.durationTo);

            const start = DateTime.fromISO(
                `${dateStr}T${String(from.hours).padStart(2, "0")}:${String(from.minutes).padStart(2, "0")}:00`,
                { zone: `UTC${timeZone}` }
            ).toUTC();

            let end = DateTime.fromISO(
                `${dateStr}T${String(to.hours).padStart(2, "0")}:${String(to.minutes).padStart(2, "0")}:00`,
                { zone: `UTC${timeZone}` }
            ).toUTC();

            if (end <= start) {
                end = end.plus({ days: 1 }); // overnight handling
            }

            // Add small buffer to avoid premature deletion
            const gracePeriod = 60; // seconds
            if (end.plus({ seconds: gracePeriod }) <= nowUTC) {
                await handleDeleteVideoCallDirectly(slot._id.toString());
                await updateTrendScoreForSlot(slot._id.toString());
                console.log(`[cleanupExpiredVideoCalls] Deleted expired video call for slot ${slot._id}`);
            }

        } catch (err) {
            console.error(`[cleanupExpiredVideoCalls] Error processing call ${call._id}:`, err);
        }
    }
}
