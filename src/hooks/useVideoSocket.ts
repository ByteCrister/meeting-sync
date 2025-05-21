"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { initializeServerSocket } from "@/utils/socket/socketInitialized";
import { SocketTriggerTypes } from "@/utils/constants";
import { addChatMessage, addParticipant, removeChatMessage, removeParticipant, setVideoCallStatus, updateSettings, VideoCallStatus } from "@/lib/features/videoMeeting/videoMeetingSlice";
import ShadcnToast from "@/components/global-ui/toastify-toaster/ShadcnToast";


const useVideoSocket = (roomId: string) => {
    const { user } = useAppSelector(state => state.userStore);
    const dispatch = useAppDispatch();
    const socketRef = useRef<ReturnType<typeof initiateSocket> | null>(null);

    useEffect(() => {
        if (!user?._id || !roomId) return;

        const setupVideoSocket = async () => {
            await initializeServerSocket();

            if (!socketRef.current) {
                socketRef.current = getSocket();
            }

            const socket = socketRef.current;

            if (socket.disconnected) {
                socket.connect();
            }

            //* Remove previous listeners
            socket.off(SocketTriggerTypes.HOST_JOINED);
            socket.off(SocketTriggerTypes.NEW_PARTICIPANT_JOINED);
            socket.off(SocketTriggerTypes.NEW_METING_CHAT_MESSAGE);
            socket.off(SocketTriggerTypes.DELETE_METING_CHAT_MESSAGE);
            socket.off(SocketTriggerTypes.CHANGE_MEETING_SETTING);
            socket.off(SocketTriggerTypes.USER_LEAVED);


            // Host just joined the meeting
            socket.on(SocketTriggerTypes.HOST_JOINED, () => {
                ShadcnToast("Host just joined to the meeting.");
                setVideoCallStatus(VideoCallStatus.ACTIVE);
            });
            socket.on(SocketTriggerTypes.NEW_PARTICIPANT_JOINED, (data) => {
                dispatch(addParticipant(data));
            });
            socket.on(SocketTriggerTypes.NEW_METING_CHAT_MESSAGE, (data) => {
                dispatch(addChatMessage(data));
            });
            socket.on(SocketTriggerTypes.DELETE_METING_CHAT_MESSAGE, ({ _id }) => {
                dispatch(removeChatMessage(_id));
            });
            socket.on(SocketTriggerTypes.CHANGE_MEETING_SETTING, (data) => {
                dispatch(updateSettings(data));
            });
            socket.on(SocketTriggerTypes.USER_LEAVED, ({ userId }) => {
                removeParticipant(userId);
            });
            socket.on(SocketTriggerTypes.MEETING_ENDED, () => {
                setVideoCallStatus(VideoCallStatus.ENDED);
            });

            socket.on("disconnect", (reason) => {
                console.log("Video socket disconnected", reason);
            });
        };

        setupVideoSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit(SocketTriggerTypes.LEAVE_ROOM, { roomId, userId: user._id });
                socketRef.current.off();
                socketRef.current.disconnect();
                console.log("Video socket cleanup: disconnected");
            }
            socketRef.current = null;
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, roomId]);
};

export default useVideoSocket;