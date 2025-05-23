// utils/socket/triggerSocketEvent.ts

import { SocketTriggerTypes } from "../constants";
import { removeParticipantFromAllCalls } from "../server/removeParticipantFromCall";
// import { getSocket } from "./initiateSocket";
import { getIOInstance } from "./setIOInstance";
import { getUserSocketId } from "./socketUserMap";

interface TriggerSocketParams {
    userId: string;
    type: SocketTriggerTypes;
    notificationData: unknown;
}

export const triggerSocketEvent = async ({ userId, type, notificationData }: TriggerSocketParams) => {
    const io = getIOInstance();
    const socketId = getUserSocketId(userId);

    if (!io) {
        console.warn("⚠️ Socket.IO instance not initialized");
        return;
    }

    if (!socketId) {
        // const socket = getSocket();
        // socket.emit(SocketTriggerTypes.REGISTER_USER, { userId: userId });
        await removeParticipantFromAllCalls(userId);
        console.warn(`⚠️ No active socketId found for userId: ${userId}`);
        return;
    }

    try {
        io.to(socketId).emit(type, { userId, notificationData });
        console.log(`---------------- Socket event '${type}' sent to userId: ${userId} ---------------`);
    } catch (err) {
        console.error("Error triggering socket event:", err);
    }
};
