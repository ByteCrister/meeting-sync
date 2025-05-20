import mongoose from "mongoose";
import { IVideoCall } from "@/models/VideoCallModel"; 

export async function calculateAndUpdateEngagement(call: IVideoCall) {
  if (!call.endTime || !call.startTime) return;

  const totalCallTime = call.endTime.getTime() - call.startTime.getTime();
  if (totalCallTime <= 0) return;

  let totalEngagement = 0;
  let countedParticipants = 0;

  for (const p of call.participants) {
    if (!Array.isArray(p.sessions) || p.sessions.length === 0) continue;

    let totalParticipantTime = 0;

    for (const session of p.sessions) {
      const joinedAt = new Date(session.joinedAt);
      const leftAt = session.leftAt ? new Date(session.leftAt) : call.endTime;

      if (joinedAt >= call.endTime) continue;

      const sessionEnd = leftAt > call.endTime ? call.endTime : leftAt;
      const sessionTime = Math.max(0, sessionEnd.getTime() - joinedAt.getTime());

      totalParticipantTime += sessionTime;
    }

    if (totalParticipantTime > 0) {
      const ratio = totalParticipantTime / totalCallTime;
      totalEngagement += Math.min(1, ratio);
      countedParticipants++;
    }
  }

  const averageEngagementRate =
    countedParticipants > 0 ? (totalEngagement / countedParticipants) : 0;

  await mongoose.model("slots").findByIdAndUpdate(call.meetingId, {
    engagementRate: Math.round(averageEngagementRate * 100),
  });
}