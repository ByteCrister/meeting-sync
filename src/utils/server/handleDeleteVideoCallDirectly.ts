import ConnectDB from "@/config/ConnectDB";
import VideoCallModel, { IVideoCallParticipant, IVideoCallSession } from "@/models/VideoCallModel";
import mongoose from "mongoose";
import { calculateAndUpdateEngagement } from "./calculateAndUpdateEngagement";

export async function handleDeleteVideoCallDirectly(meetingId: string) {
  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    throw new Error("Invalid meetingId");
  }

  await ConnectDB();

  const videoCall = await VideoCallModel.findOne({ meetingId });
  if (!videoCall) throw new Error("Meeting not found");

  // Update all open sessions (null leftAt) to endTime or now
  videoCall.participants.forEach((participant: IVideoCallParticipant) => {
    participant.sessions.forEach((session: IVideoCallSession) => {
      if (!session.leftAt) {
        session.leftAt = videoCall.endTime || new Date();
      }
    });
  });

  await videoCall.save();

  // Recalculate engagement before deleting
  await calculateAndUpdateEngagement(videoCall);

  // Now delete the call
  await VideoCallModel.deleteOne({ meetingId });
}