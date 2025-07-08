import VideoCallModel from "@/models/VideoCallModel";
import SlotModel from "@/models/SlotModel";
import { DateTime } from "luxon";
import ConnectDB from "@/config/ConnectDB";
import { handleDeleteVideoCallDirectly } from "./handleDeleteVideoCallDirectly";
import { updateTrendScoreForSlot } from "./updateTrendScoreForSlot";
import { parseTime } from "./handleCreateVideoCallDirectly";

export async function cleanupExpiredVideoCalls() {
    try {
        await ConnectDB();
    } catch (connErr) {
        console.log("[cleanupExpiredVideoCalls] Failed to connect to DB:", connErr);
        return;
    }

    const nowUTC = DateTime.utc().toJSDate();

    let videoCalls;
    try {
        videoCalls = await VideoCallModel.find();
    } catch (err) {
        console.log("[cleanupExpiredVideoCalls] Failed to fetch video calls:", err);
        return;
    }

    for (const call of videoCalls) {
        try {
            const slot = await SlotModel.findById(call.meetingId);
            if (!slot) {
                console.warn(`[cleanupExpiredVideoCalls] Slot not found for call ${call._id}. Deleting orphan video call.`);
                await VideoCallModel.deleteOne({ _id: call._id });
                continue;
            }

            const meetingDate = new Date(slot.meetingDate);
            const startTime = parseTime(slot.durationFrom, meetingDate);
            const endTime = parseTime(slot.durationTo, meetingDate);
            if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

            if (endTime <= nowUTC) {
                // Time is up, delete video call and update trend
                await handleDeleteVideoCallDirectly(slot._id.toString());
                await updateTrendScoreForSlot(slot._id.toString());
                console.log(`[cleanupExpiredVideoCalls] Deleted expired video call for slot ${slot._id}`);
            }
        } catch (err) {
            console.log(`[cleanupExpiredVideoCalls] log processing video call ${call._id}:`, err);
        }
    }
}