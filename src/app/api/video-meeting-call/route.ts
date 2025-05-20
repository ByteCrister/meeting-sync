import ConnectDB from "@/config/ConnectDB";
import SlotModel, { ISlot } from "@/models/SlotModel";
import VideoCallModel, { IVideoCall } from "@/models/VideoCallModel";
import { IVideoCallStatus, VideoCallErrorTypes } from "@/utils/constants";
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

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({
                isError: true,
                errorType: VideoCallErrorTypes.USER_NOT_FOUND,
            });
        }

        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get("meetingId");

        if (!meetingId || !mongoose.Types.ObjectId.isValid(meetingId)) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.MEETING_NOT_FOUND,
            });
        }

        const meeting = await VideoCallModel.findOne({ meetingId }).lean() as IVideoCall | null;
        if (!meeting) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.MEETING_NOT_FOUND,
            });
        }

        if (meeting.status === IVideoCallStatus.ENDED) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.MEETING_ENDED,
            });
        }

        const slot = await SlotModel.findById(meetingId).lean() as ISlot | null;
        if (!slot || !slot.bookedUsers.map(id => id.toString()).includes(userId.toString())) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.USER_NOT_PARTICIPANT,
            });
        }

        const alreadyJoined = meeting.participants.some(
            (p) => p.userId.toString() === userId.toString()
        );

        if (alreadyJoined) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.USER_ALREADY_JOINED,
            });
        }

        // All checks passed
        return NextResponse.json({
            success: true,
            isError: false,
            message: "User can join the video call.",
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({
            isError: true,
            errorType: "INTERNAL_SERVER_ERROR",
        });
    }
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