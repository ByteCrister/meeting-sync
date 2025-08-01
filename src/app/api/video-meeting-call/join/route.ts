import ConnectDB from '@/config/ConnectDB';
import VideoCallModel, { IVideoCall, IVideoCallParticipant } from '@/models/VideoCallModel';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import { Types } from 'mongoose';
import { triggerSocketEvent } from '@/utils/socket/triggerSocketEvent';
import { IVideoCallStatus, SocketTriggerTypes } from '@/utils/constants';
import SlotModel from '@/models/SlotModel';
import NotificationsModel, { INotificationType } from '@/models/NotificationsModel';
import UserModel from '@/models/UserModel';
import getNotificationExpiryDate from '@/utils/server/getNotificationExpiryDate';
import { getUserSocketId } from '@/utils/socket/socketUserMap';
import { triggerRoomSocketEvent } from '@/utils/socket/triggerRoomSocketEvent';

// ? Joining to a video meeting
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!meetingId) {
        return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    try {
        await ConnectDB();

        const user = await UserModel.findById(userId).select('image username');

        // * Find the video call only if status is not ended
        const videoCall: IVideoCall | null = await VideoCallModel.findOne({
            meetingId,
            status: { $ne: IVideoCallStatus.ENDED }
        });

        if (!videoCall) {
            return NextResponse.json({ message: 'Meeting not found or has ended' }, { status: 404 });
        }

        // * Is the user is host or participant
        const isHost = String(videoCall.hostId) === String(userId);

        // * If user is host then add him to participants and make all waiting participants join and send notification to all booked users
        if (isHost) {
            // Add host to participants if not already there
            const alreadyJoined = videoCall.participants.some(
                (p: IVideoCallParticipant) => String(p.userId) === String(userId)
            );

            if (!alreadyJoined) {
                videoCall.participants.push({
                    userId,
                    socketId: await getUserSocketId(userId) || "",
                    isMuted: false,
                    isVideoOn: false,
                    isScreenSharing: false,
                    sessions: [{ joinedAt: new Date() }],
                    isActive: true, // Mark host as active
                });
            } else {
                const participantIndex = videoCall.participants.findIndex((p: IVideoCallParticipant) => String(p.userId) === String(userId));
                videoCall.participants[participantIndex].socketId = await getUserSocketId(userId) || "";
                videoCall.participants[participantIndex].sessions.push({ joinedAt: new Date() });
                videoCall.participants[participantIndex].isActive = true;
            }

            //* Activate meeting if not already and join all waiting participants to the meeting
            if (videoCall.status !== IVideoCallStatus.ACTIVE) {
                videoCall.status = IVideoCallStatus.ACTIVE;

                // * Join all waiting participants to the meeting
                videoCall.waitingParticipants?.forEach((p: { userId: string | Types.ObjectId; requestedAt: Date; }) => {
                    triggerSocketEvent({
                        userId: p.userId.toString(),
                        type: SocketTriggerTypes.HOST_JOINED,
                        notificationData: { slot: meetingId, message: "The Host just started the meeting!" },
                    });
                });

                // * Send notification all user who booked the slot
                const user = await UserModel.findById(userId).select("image");
                const slot = await SlotModel.findById(meetingId);
                if (!slot) {
                    return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
                }

                // * Notification structure
                const sendNewNotification = {
                    type: INotificationType.MEETING_STARTED,
                    sender: userId.toString(),
                    image: user.image,
                    slot: meetingId,
                    message: "The Host just started the meeting!",
                    isRead: false,
                    isClicked: false,
                    createdAt: new Date(),
                    expiresAt: getNotificationExpiryDate(30),
                };

                await Promise.all(slot.bookedUsers.map(async (bookedUserId: string) => {
                    const notificationDoc = new NotificationsModel({ ...sendNewNotification, receiver: bookedUserId });
                    await notificationDoc.save();
                    await UserModel.findByIdAndUpdate(bookedUserId, { $inc: { countOfNotifications: 1 } });
                }));

                // ? emit socket event to notify user's that host is joined and join waiting participants in the meeting
                triggerRoomSocketEvent({ roomId: meetingId, type: SocketTriggerTypes.HOST_JOINED, data: { userId } });
                for (const participant of videoCall.waitingParticipants) {
                    triggerSocketEvent({
                        userId: participant.userId.toString(),
                        type: SocketTriggerTypes.HOST_JOINED,
                        notificationData: `Host just started the meeting!`
                    });
                }

                // * Clear waiting participants after host joins
                videoCall.waitingParticipants = [];
            }
            const participantIndex = videoCall.participants.findIndex(
                (p: IVideoCallParticipant) => String(p.userId) === String(userId)
            );
            triggerRoomSocketEvent({
                roomId: meetingId,
                type: SocketTriggerTypes.NEW_PARTICIPANT_JOINED,
                data: {
                    userId,
                    image: user.image,
                    username: user.username,
                    socketId: getUserSocketId(userId),
                    isMuted: false,
                    isVideoOn: false,
                    isScreenSharing: false,
                    sessions: participantIndex !== -1 ? videoCall.participants[participantIndex].sessions : [{ joinedAt: new Date() }]
                }
            });
            await videoCall.save();

            // *** If user is NOT host ***
        } else {
            if (videoCall.status === IVideoCallStatus.WAITING) {
                // * Push to waitingParticipants if not already added
                const alreadyWaiting = videoCall.waitingParticipants?.some(
                    (p: { userId: string | Types.ObjectId; requestedAt: Date; }) => String(p.userId) === String(userId)
                );

                if (!alreadyWaiting) {
                    videoCall.waitingParticipants?.push({
                        userId,
                        requestedAt: new Date(),
                    });
                    await videoCall.save();
                }

                return NextResponse.json({ success: true, meetingStatus: IVideoCallStatus.WAITING, message: 'Waiting for host to start the meeting' }, { status: 202 });
            }
            const participantIndex = videoCall.participants.findIndex(
                (p: IVideoCallParticipant) => String(p.userId) === String(userId)
            );

            // If meeting is ACTIVE and user is not in participants, joining the meeting
            if (participantIndex === -1) {
                videoCall.participants.push({
                    userId,
                    socketId: await getUserSocketId(userId) || "",
                    isMuted: false,
                    isVideoOn: false,
                    isScreenSharing: false,
                    sessions: [{ joinedAt: new Date() }],
                    isActive: true, // Mark participant as active
                });
            } else {
                // Already a participant — update join time and clear leftAt
                videoCall.participants[participantIndex].socketId = await getUserSocketId(userId) || "";
                videoCall.participants[participantIndex].sessions.push({ joinedAt: new Date() });
                videoCall.participants[participantIndex].isActive = true; // Ensure participant is marked as active

            }
            triggerRoomSocketEvent({
                roomId: meetingId,
                type: SocketTriggerTypes.NEW_PARTICIPANT_JOINED,
                data: {
                    userId,
                    image: user.image,
                    username: user.username,
                    socketId: getUserSocketId(userId),
                    isMuted: false,
                    isVideoOn: false,
                    isScreenSharing: false,
                    sessions: participantIndex !== -1 ? videoCall.participants[participantIndex].sessions : [{ joinedAt: new Date() }]
                }
            });
            await videoCall.save();
        }

        // Fetch usernames and images
        const userIds = videoCall.participants.map((p: IVideoCallParticipant) => p.userId.toString());
        const users = await UserModel.find({ _id: { $in: userIds } }).select('username image');

        // Map users to a lookup
        const userMap = new Map(users.map(u => [u._id.toString(), { username: u.username, image: u.image }]));

        // Enrich participants
        const enrichedParticipants = (videoCall.participants ?? [])
            .filter(p => p.isActive)
            .map((p: IVideoCallParticipant) => ({
                userId: p.userId,
                socketId: p.socketId,
                isMuted: p.isMuted,
                isVideoOn: p.isVideoOn,
                isScreenSharing: p.isScreenSharing,
                sessions: p.sessions,
                username: userMap.get(p.userId.toString())?.username || 'Unknown',
                image: userMap.get(p.userId.toString())?.image || '',
            }));

        // Then return full response
        return NextResponse.json({
            success: true,
            message: 'Joined the meeting successfully',
            meeting: {
                meetingId: videoCall.meetingId,
                hostId: videoCall.hostId,
                status: videoCall.status,
                startTime: videoCall.startTime,
                endTime: videoCall.endTime,
                participants: enrichedParticipants,
                chatMessages: videoCall.chatMessages,
                settings: videoCall.settings,
            },
        }, { status: 202 });

    } catch (error) {
        console.error('Error in joining meeting:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized user" }, { status: 401 });
        }

        const { meetingId, isActive } = await req.json() as { meetingId: string, isActive: boolean };

        if (!meetingId || typeof isActive !== 'boolean') {
            return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
        }

        const updatedCall = await VideoCallModel.findOneAndUpdate(
            {
                meetingId,
                "participants.userId": userId,
            },
            {
                $set: {
                    "participants.$.isActive": isActive,
                }
            },
            { new: true }
        );

        if (!updatedCall) {
            return NextResponse.json({ success: false, message: "Participant or meeting not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Participant activity updated",
            data: updatedCall.participants.find((p: IVideoCallParticipant) => p.userId.toString() === userId.toString())
        });
    } catch (err) {
        console.error("Error updating user video activity:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// ? Leaving from a video meeting call
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get('meetingId');
        const userId = await getUserIdFromRequest(req);

        if (!meetingId || !userId) {
            return NextResponse.json({ message: 'Missing meetingId or unauthorized' }, { status: 400 });
        }

        const videoCall: IVideoCall | null = await VideoCallModel.findOne({ meetingId });

        if (!videoCall) {
            return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
        }

        // Prevent host from leaving this way
        if (String(videoCall.hostId) === String(userId)) {
            return NextResponse.json({ message: 'Host cannot leave the call this way' }, { status: 403 });
        }

        // Find the participant
        const participant = videoCall.participants.find(
            (p) => String(p.userId) === String(userId)
        );

        if (!participant || !participant.sessions || participant.sessions.length === 0) {
            return NextResponse.json({ message: 'Participant not found or no sessions' }, { status: 404 });
        }

        participant.isActive = false; // Mark participant as inactive

        // Find the last session with no leftAt
        const latestSession = [...participant.sessions].reverse().find(
            (session) => !session.leftAt
        );

        if (!latestSession) {
            return NextResponse.json({ message: 'No active session found for user' }, { status: 404 });
        }

        latestSession.leftAt = new Date();

        await videoCall.save();


        return NextResponse.json({ success: true, message: 'Left the call successfully' }, { status: 200 });

    } catch (error) {
        console.error('[LEAVE_VIDEO_CALL_ERROR]', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
};