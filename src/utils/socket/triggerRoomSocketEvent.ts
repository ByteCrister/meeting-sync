// utils/socket/triggerRoomSocketEvent.ts

import { SocketTriggerTypes } from "../constants";
import { getIOInstance } from "./setIOInstance";

interface TriggerRoomSocketParams {
    roomId: string;
    type: SocketTriggerTypes;
    data: unknown;
}

export const triggerRoomSocketEvent = ({ roomId, type, data }: TriggerRoomSocketParams) => {
    const io = getIOInstance();

    if (!io) {
        console.warn("Socket.IO instance not initialized");
        return;
    }

    try {
        io.to(roomId).emit(type, data);
        console.log(`Socket event '${type}' sent to all in roomId: ${roomId}`);
    } catch (err) {
        console.error("Error triggering room socket event:", err);
    }
};