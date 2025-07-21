// src/utils/socket/triggerRoomSocketEvent.ts (Next.js)
import axios from "axios";
import { SocketTriggerTypes } from "../constants";

interface TriggerRoomSocketParams {
    roomId: string;
    type: SocketTriggerTypes;
    data: unknown;
    namespace?: "chat" | "video";
}

export const triggerRoomSocketEvent = async ({
    roomId,
    type,
    data,
    namespace = "video",
}: TriggerRoomSocketParams) => {
    try {
        await axios
            .post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || process.env.SOCKET_SERVER_URL}/api/trigger-room-event`, {
                roomId,
                type,
                data,
                namespace,
            },
                {
                    headers: {
                        "x-api-key": process.env.SOCKET_API_SECRET_KEY || process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY,
                    },
                }
            );
    } catch (err) {
        console.log("Failed to trigger room socket event:", err);
    }
};