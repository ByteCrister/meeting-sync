import ConnectDB from "@/config/ConnectDB";
import VideoCallModel from "@/models/VideoCallModel";
import mongoose from "mongoose";

export async function handleDeleteVideoCallDirectly(meetingId: string) {
  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    throw new Error("Invalid meetingId");
  }

  await ConnectDB();

  const deleted = await VideoCallModel.findOneAndDelete({ meetingId });

  if (!deleted) {
    throw new Error("Meeting not found");
  }

  return deleted;
}