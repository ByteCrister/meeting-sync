import ConnectDB from '@/config/ConnectDB';
import VideoCallModel, { IVideoCallStatus } from '@/models/VideoCallModel';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/utils/server/getUserFromToken';
import { Types } from 'mongoose';
import { triggerSocketEvent } from '@/utils/socket/triggerSocketEvent';
import { SocketTriggerTypes } from '@/utils/constants';
import SlotModel from '@/models/SlotModel';
import NotificationsModel, { INotificationType } from '@/models/NotificationsModel';
import UserModel from '@/models/UserModel';
import getNotificationExpiryDate from '@/utils/server/getNotificationExpiryDate';

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

        // * Find the video call only if status is not ended
        const videoCall = await VideoCallModel.findOne({
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
                (p: {
                    userId: string | Types.ObjectId;
                    isMuted: boolean;
                    isVideoOn: boolean;
                    joinedAt: Date;
                }) => String(p.userId) === String(userId)
            );

            if (!alreadyJoined) {
                videoCall.participants.push({
                    userId,
                    isMuted: false,
                    isVideoOn: false,
                    joinedAt: new Date(),
                });
            }

            // Activate meeting if not already
            if (videoCall.status !== IVideoCallStatus.ACTIVE) {
                videoCall.status = IVideoCallStatus.ACTIVE;
            }

            await videoCall.save();

            // * Join all waiting participants to the meeting
            videoCall.waitingParticipants?.forEach((p: { userId: string | Types.ObjectId; requestedAt: Date; }) => {
                triggerSocketEvent({
                    userId: p.userId.toString(),
                    type: SocketTriggerTypes.HOST_JOINED,
                    notificationData: `The host has joined the meeting!`,
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
                const savedNotification = await notificationDoc.save();

                await UserModel.findByIdAndUpdate(bookedUserId, { $inc: { countOfNotifications: 1 } });

                triggerSocketEvent({
                    userId: bookedUserId,
                    type: SocketTriggerTypes.MEETING_STARTED,
                    notificationData: { ...sendNewNotification, receiver: bookedUserId, _id: savedNotification._id },
                });
            }));


        } else {
            // * If user is NOT host
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

                return NextResponse.json({ message: 'Waiting for host to start the meeting' }, { status: 202 });
            }

            // If meeting is ACTIVE and user is not in participants
            const alreadyParticipant = videoCall.participants.some(
                (p: {
                    userId: string | Types.ObjectId;
                    isMuted: boolean;
                    isVideoOn: boolean;
                    joinedAt: Date;
                }) => String(p.userId) === String(userId)
            );

            if (!alreadyParticipant) {
                videoCall.participants.push({
                    userId,
                    isMuted: false,
                    isVideoOn: true,
                    joinedAt: new Date(),
                });
                await videoCall.save();
            }
        }

        return NextResponse.json({ message: 'Joined the meeting successfully' }, { status: 202 });
    } catch (error) {
        console.error('Error in joining meeting:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ? Leaving from a video meeting call or deleting it if host
// ! Have to change the logic
export async function DELETE(req: NextRequest) {
    try {
        await ConnectDB();

        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get('meetingId');
        const userId = await getUserIdFromRequest(req);

        if (!meetingId || !userId) {
            return NextResponse.json({ message: 'Missing meetingId or unauthorized' }, { status: 400 });
        }

        const videoCall = await VideoCallModel.findOne({ meetingId });

        if (!videoCall) {
            return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
        }

        const isHost = String(videoCall.hostId) === String(userId);

        if (isHost) {
            // If the user is the host, delete the entire video call document
            await VideoCallModel.deleteOne({ meetingId });
            return NextResponse.json({ message: 'Video call deleted by host' }, { status: 200 });
        } else {
            // If the user is a participant, remove them from the participants array
            const updateResult = await VideoCallModel.updateOne(
                { meetingId },
                { $pull: { participants: { userId } } }
            );

            if (updateResult.modifiedCount === 0) {
                return NextResponse.json({ message: 'User not found in participants or update failed' }, { status: 404 });
            }

            return NextResponse.json({ message: 'Left the call successfully' }, { status: 200 });
        }
    } catch (error) {
        console.log('[LEAVE_VIDEO_CALL_ERROR]', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}