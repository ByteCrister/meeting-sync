// G:\Projects\meeting-sync\src\hooks\useNotificationSocket.ts (Next.js)
"use client";

import ShadcnToast from "@/components/global-ui/toastify-toaster/ShadcnToast";
import { updateBookedMeetingStatus } from "@/lib/features/booked-meetings/bookedSlice";
import { addNewMessage, deleteChatMessage, setCountOfUnseenMessage, updateSeenMessage } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { updateSlotBookedUsers } from "@/lib/features/news-feed/newsFeedSlice";
import { decreaseBookedUsers, increaseBookedUsers, updateSlotStatus } from "@/lib/features/Slots/SlotSlice";
import { addSingleNotification, incrementNotificationCount } from "@/lib/features/users/userSlice";
import { setVideoCallStatus, VideoCallStatus } from "@/lib/features/videoMeeting/videoMeetingSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RegisterSlotStatus } from "@/types/client-types";
import { NotificationType, SocketTriggerTypes } from "@/utils/constants";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { useEffect, useRef } from "react";

const useNotificationSocket = () => {
    const { user } = useAppSelector(state => state.userStore);
    const countOfUnseenMessages = useAppSelector(state => state.chatBoxStore.countOfUnseenMessages);
    const activeChatParticipant = useAppSelector(state => state.chatBoxStore.activeUserChat.user);
    const dispatch = useAppDispatch();
    const socketRef = useRef<ReturnType<typeof initiateSocket> | null>(null);

    // Used to prevent duplicate event bindings
    const listenersAttachedRef = useRef(false);

    const activeChatRef = useRef(activeChatParticipant);
    const userIdRef = useRef<string | null>(null);

    useEffect(() => {
        activeChatRef.current = activeChatParticipant;
    }, [activeChatParticipant]);


    useEffect(() => {
        if (!user?._id) return;

        const setupSocket = async () => {

            if (!socketRef.current) {
                socketRef.current = getSocket("chat"); // * uses single socket for both notification and chat messaging
            }

            const socket = socketRef.current;

            // Ensure connection
            if (socket.disconnected) {
                socket.connect();
            }

            // Always remove previous listeners before setting new ones
            socket.removeAllListeners();

            // Only attach listeners once per mount (even if user/participant changes)
            if (!listenersAttachedRef.current) {
                listenersAttachedRef.current = true;

                socket.on(SocketTriggerTypes.RECEIVED_NOTIFICATION, (data) => {
                    const isSenderDisabled = user?.disabledNotificationUsers?.includes(data.notificationData.sender);
                    if (!isSenderDisabled) {
                        dispatch(addSingleNotification(data.notificationData));
                        dispatch(incrementNotificationCount());
                        ShadcnToast("New notification arrived!");
                    }
                });

                // Video Meeting is created soon Host will join
                socket.on(SocketTriggerTypes.MEETING_STARTED, (data) => {
                    const { notification, slotId } = data.notificationData;
                    dispatch(addSingleNotification(notification));
                    dispatch(incrementNotificationCount());
                    dispatch(updateBookedMeetingStatus({ slotId, newStatus: RegisterSlotStatus.Ongoing }));
                    ShadcnToast("New notification arrived!");
                });

                socket.on(SocketTriggerTypes.USER_SLOT_BOOKED, (data) => {
                    dispatch(updateSlotBookedUsers({
                        userId: data.sender,
                        slotId: data.slotId,
                        type: NotificationType.SLOT_BOOKED,
                    }));
                });

                socket.on(SocketTriggerTypes.INCREASE_BOOKED_USER, (data) => {
                    dispatch(increaseBookedUsers({
                        sloId: data.notificationData.slotId,
                        newBookedUserId: data.notificationData.newBookedUserId,
                    }));
                });

                socket.on(SocketTriggerTypes.DECREASE_BOOKED_USER, (data) => {
                    dispatch(decreaseBookedUsers({
                        sloId: data.notificationData.slotId,
                        bookedUserId: data.notificationData.bookedUserId,
                    }));
                });

                socket.on(SocketTriggerTypes.USER_SLOT_UNBOOKED, (data) => {
                    dispatch(updateSlotBookedUsers({
                        userId: data.sender,
                        slotId: data.slotId,
                        type: NotificationType.SLOT_UNBOOKED,
                    }));
                });

                socket.on(SocketTriggerTypes.MEETING_TIME_STARTED, (data) => {
                    dispatch(addSingleNotification(data.notificationData));
                    dispatch(incrementNotificationCount());
                    ShadcnToast("Please start the meeting.");
                    dispatch(updateSlotStatus({
                        slotId: data.notificationData.slot,
                        newStatus: RegisterSlotStatus.Ongoing,
                    }));
                });

                socket.on(SocketTriggerTypes.SEND_NEW_CHAT_MESSAGE, (data) => {
                    console.log(`New Message: ${data.notificationData}`);
                    if (activeChatRef.current?._id === data.notificationData.user_id) {
                        dispatch(addNewMessage(data.notificationData));
                    }
                });

                socket.on(SocketTriggerTypes.UPDATE_MESSAGE_SEEN, (data) => {
                    if (activeChatRef.current?._id === data.notificationData.user_id) {
                        dispatch(updateSeenMessage(data.notificationData.data));
                    }
                });

                socket.on(SocketTriggerTypes.DELETE_CHAT_MESSAGE, (data) => {
                    dispatch(deleteChatMessage(data.notificationData));
                });

                socket.on(SocketTriggerTypes.INCREASE_UNSEEN_MESSAGE_COUNT, () => {
                    console.log(`Increase Notification count`);
                    dispatch(setCountOfUnseenMessage(countOfUnseenMessages + 1));
                });

                socket.on(SocketTriggerTypes.HOST_JOINED, () => {
                    dispatch(setVideoCallStatus(VideoCallStatus.ACTIVE));
                });

            }

            // Register events
            socket.on("connect", () => {
                if (!userIdRef.current) {
                    socket.emit(SocketTriggerTypes.REGISTER_USER, { userId: user._id });
                    userIdRef.current = user._id;
                }
            });

            socket.on("disconnect", (reason) => {
                console.log("Socket disconnected", reason);
            });
        };

        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.off();
            }
            listenersAttachedRef.current = false;
        };

    }, [countOfUnseenMessages, dispatch, user?._id, user?.disabledNotificationUsers]);

};

export default useNotificationSocket;