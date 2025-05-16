"use client";

import ShadcnToast from "@/components/global-ui/toastify-toaster/ShadcnToast";
import { updateBookedMeetingStatus } from "@/lib/features/booked-meetings/bookedSlice";
import { addNewMessage, deleteChatMessage, setCountOfUnseenMessage } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { updateSlotBookedUsers } from "@/lib/features/news-feed/newsFeedSlice";
import { decreaseBookedUsers, increaseBookedUsers, updateSlotStatus } from "@/lib/features/Slots/SlotSlice";
import { addSingleNotification, incrementNotificationCount } from "@/lib/features/users/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RegisterSlotStatus } from "@/types/client-types";
import { NotificationType, SocketTriggerTypes } from "@/utils/constants";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { initializeServerSocket } from "@/utils/socket/socketInitialized";
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

    useEffect(() => {
        activeChatRef.current = activeChatParticipant;
    }, [activeChatParticipant]);


    useEffect(() => {
        if (!user?._id) return;

        const setupSocket = async () => {
            await initializeServerSocket();

            if (!socketRef.current) {
                socketRef.current = getSocket();
            }

            const socket = socketRef.current;

            // Ensure connection
            if (socket.disconnected) {
                socket.connect();
            }

            // Always remove previous listeners before setting new ones
            socket.off(SocketTriggerTypes.RECEIVED_NOTIFICATION);
            socket.off(SocketTriggerTypes.MEETING_STARTED);
            socket.off(SocketTriggerTypes.USER_SLOT_BOOKED);
            socket.off(SocketTriggerTypes.INCREASE_BOOKED_USER);
            socket.off(SocketTriggerTypes.DECREASE_BOOKED_USER);
            socket.off(SocketTriggerTypes.USER_SLOT_UNBOOKED);
            socket.off(SocketTriggerTypes.MEETING_TIME_STARTED);
            socket.off(SocketTriggerTypes.SEND_NEW_CHAT_MESSAGE);
            socket.off(SocketTriggerTypes.DELETE_CHAT_MESSAGE);
            socket.off(SocketTriggerTypes.INCREASE_UNSEEN_MESSAGE_COUNT);

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

                socket.on(SocketTriggerTypes.MEETING_STARTED, (data) => {
                    const { slot } = data.notificationData;
                    dispatch(addSingleNotification(data.notificationData));
                    dispatch(incrementNotificationCount());
                    ShadcnToast("New notification arrived!");
                    dispatch(updateBookedMeetingStatus({ slotId: slot, newStatus: RegisterSlotStatus.Ongoing }));
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
                    if (activeChatRef.current?._id === data.notificationData.user_id) {
                        dispatch(addNewMessage(data.notificationData));
                    }
                });

                socket.on(SocketTriggerTypes.DELETE_CHAT_MESSAGE, (data) => {
                    dispatch(deleteChatMessage(data.notificationData));
                });

                socket.on(SocketTriggerTypes.INCREASE_UNSEEN_MESSAGE_COUNT, () => {
                    dispatch(setCountOfUnseenMessage(countOfUnseenMessages + 1));
                });
            }

            // Register events
            socket.on("connect", () => {
                console.log("Socket connected");
                socket.emit(SocketTriggerTypes.REGISTER_USER, { userId: user._id });
            });

            socket.on("disconnect", (reason) => {
                console.log("Socket disconnected", reason);
            });
        };

        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.off(); // remove all listeners
                socketRef.current.disconnect();
                console.log("Socket cleanup: disconnected");
            }
            listenersAttachedRef.current = false; // VERY IMPORTANT
            socketRef.current = null; // optional, ensures fresh init on next mount
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

};

export default useNotificationSocket;