import ConnectDB from "@/config/ConnectDB";
import VideoCallModel from "@/models/VideoCallModel";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export interface IParticipant {
    userId: mongoose.Types.ObjectId | string;
    socketId: string;
    isMuted: boolean;
    isVideoOn: boolean;
    joinedAt: Date;
}

// ? update states of video meeting
export async function PUT(req: NextRequest) {

    try {
        await ConnectDB();
        // Parse the incoming request body
        const body = await req.json();
        const { isMuted, isVideoOn, isScreenSharing, message, meetingId } = body;
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Find the meeting by meetingId
        const videoCall = await VideoCallModel.findOne({ meetingId });

        if (!videoCall) {
            return NextResponse.json(
                { message: 'Meeting not found' },
                { status: 404 }
            );
        }

        // Find the participant in the video call
        const participantIndex = videoCall.participants.findIndex(
            (participant: IParticipant) => participant.userId.toString() === userId
        );

        if (participantIndex === -1) {
            return NextResponse.json(
                { message: 'Participant not found in the meeting' },
                { status: 404 }
            );
        }

        // Update the participant's settings
        const updatedParticipant = videoCall.participants[participantIndex];
        if (isMuted !== undefined) updatedParticipant.isMuted = isMuted;
        if (isVideoOn !== undefined) updatedParticipant.isVideoOn = isVideoOn;
        if (isScreenSharing !== undefined) updatedParticipant.isScreenSharing = isScreenSharing;

        // Update the chat messages if there's a new message
        if (message) {
            videoCall.chatMessages.push({
                userId,
                message,
                timestamp: new Date(),
            });
        }

        // Save the updated video call
        await videoCall.save();

        return NextResponse.json(
            { success: true, message: 'Video call updated successfully', videoCall },
            { status: 200 }
        );
    } catch (error) {
        console.log('Error updating video call:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating the video call' },
            { status: 500 }
        );
    }
};