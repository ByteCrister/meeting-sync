import ConnectDB from "@/config/ConnectDB";
import SlotModel, { ISlot } from "@/models/SlotModel";
import VideoCallModel, { IVideoCall } from "@/models/VideoCallModel";
import { IVideoCallStatus, SocketTriggerTypes, VCallUpdateApiType, VideoCallErrorTypes } from "@/utils/constants";
import { getUserIdFromRequest } from "@/utils/server/getUserFromToken";
import { triggerRoomSocketEvent } from "@/utils/socket/triggerRoomSocketEvent";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// * Status of the Video Meeting( getting all video and participant's validation )
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

        await ConnectDB();

        if (!meetingId || !mongoose.Types.ObjectId.isValid(meetingId)) {
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.MEETING_NOT_FOUND,
            });
        }

        const slot = await SlotModel.findById(meetingId).lean() as ISlot | null;
        if (!slot) {
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

        const isHost = slot?.ownerId?.toString() === userId.toString();
        const isValidParticipant = slot?.bookedUsers.some(id => id.toString() === userId.toString()) ? true : false;

        if (!isHost && !isValidParticipant) {
            console.log(`USER_NOT_PARTICIPANT`);
            return NextResponse.json({
                success: true,
                isError: true,
                errorType: VideoCallErrorTypes.USER_NOT_PARTICIPANT,
            });
        }

        // Check if the meeting has already started and user is already joined somewhere
        const existingParticipant = meeting.participants.find(
            (p) => p.userId.toString() === userId.toString()
        );

        if (existingParticipant?.isActive) {
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
        return NextResponse.json({ message: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}

// ? update states of video meeting
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, meetingId, data } = body;

        if (!meetingId || !type) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await ConnectDB();

        const call = await VideoCallModel.findOne({ meetingId });
        if (!call) {
            return NextResponse.json({ message: "Call not found" }, { status: 404 });
        }

        switch (type) {
            case VCallUpdateApiType.PARTICIPANTS_DATA: {
                const { userId, isMuted, isVideoOn, isScreenSharing } = data;
                if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

                await VideoCallModel.updateOne(
                    { meetingId, "participants.userId": userId },
                    {
                        $set: {
                            "participants.$.isMuted": isMuted,
                            "participants.$.isVideoOn": isVideoOn,
                            "participants.$.isScreenSharing": isScreenSharing,
                        },
                    }
                );

                break;
            }

            case VCallUpdateApiType.NEW_VIDEO_CHAT_MESSAGE: {
                const userId = await getUserIdFromRequest(req);
                if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

                const { message } = data;

                if (!message || typeof message !== "string" || !message.trim()) {
                    return NextResponse.json({ message: "Message is required and must be non-empty." }, { status: 400 });
                }

                const msgObject = {
                    _id: new mongoose.Types.ObjectId(),
                    userId: new mongoose.Types.ObjectId(userId),
                    message: message.trim(),
                    timestamp: new Date(),
                };

                await VideoCallModel.updateOne(
                    { meetingId },
                    {
                        $push: {
                            chatMessages: msgObject,
                        },
                    }
                );
                triggerRoomSocketEvent({
                    roomId: meetingId,
                    type: SocketTriggerTypes.NEW_METING_CHAT_MESSAGE,
                    data: msgObject,
                });
                return NextResponse.json({ success: true, message: 'Message send.', data: msgObject }, { status: 200 });
            }

            case VCallUpdateApiType.REMOVE_VIDEO_CHAT_MESSAGE: {
                const { messageId: _id } = data;

                if (!_id) {
                    return NextResponse.json({ message: 'Message _id is required' }, { status: 400 });
                }

                const result = await VideoCallModel.updateOne(
                    { meetingId },
                    {
                        $pull: {
                            chatMessages: { _id },
                        },
                    }
                );

                if (result.modifiedCount === 0) {
                    return NextResponse.json({ message: 'Message not found or already removed' }, { status: 404 });
                }
                triggerRoomSocketEvent({
                    roomId: meetingId,
                    type: SocketTriggerTypes.DELETE_METING_CHAT_MESSAGE,
                    data: { _id },
                });
                break;
            }


            case VCallUpdateApiType.HOST_SETTING: {
                const userId = await getUserIdFromRequest(req);
                if (!userId || userId.toString() !== call.hostId.toString()) {
                    return NextResponse.json({ message: "Only host can update settings" }, { status: 403 });
                }

                const { allowChat, allowRecording, allowScreenShare } = data;

                await VideoCallModel.updateOne(
                    { meetingId },
                    {
                        $set: {
                            "settings.allowChat": allowChat,
                            "settings.allowRecording": allowRecording,
                            "settings.allowScreenShare": allowScreenShare,
                        },
                    }
                );
                triggerRoomSocketEvent({
                    roomId: meetingId,
                    type: SocketTriggerTypes.CHANGE_MEETING_SETTING,
                    data: { allowChat, allowRecording, allowScreenShare },
                });
                break;
            }

            default:
                return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'New response got successfully.' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}