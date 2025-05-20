"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { initializeServerSocket } from "@/utils/socket/socketInitialized";
import { SocketTriggerTypes } from "@/utils/constants";
import { addParticipant } from "@/lib/features/videoMeeting/videoMeetingSlice";


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

            // Remove previous listeners
            socket.off(SocketTriggerTypes.NEW_PARTICIPANT_JOINED);
            // socket.off(SocketTriggerTypes.PARTICIPANT_LEFT);
            // socket.off(SocketTriggerTypes.STREAM_UPDATED);
            // socket.off(SocketTriggerTypes.CALL_ENDED);

            socket.on(SocketTriggerTypes.NEW_PARTICIPANT_JOINED, (data) => {
                dispatch(addParticipant(data));
            });

            // socket.on(SocketTriggerTypes.PARTICIPANT_LEFT, (data) => {
            //     dispatch(removeParticipant(data.userId));
            // });

            // socket.on(SocketTriggerTypes.STREAM_UPDATED, (data) => {
            //     dispatch(updateParticipantStream(data));
            // });

            // socket.on(SocketTriggerTypes.CALL_ENDED, () => {
            //     dispatch(setCallStatus("ended"));
            // });

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