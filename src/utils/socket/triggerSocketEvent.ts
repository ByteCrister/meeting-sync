// G:\Projects\meeting-sync\src\utils\socket\triggerSocketEvent.ts (next.js)
import axios from "axios";
import { SocketTriggerTypes } from "../constants";

interface TriggerSocketParams {
    userId: string;
    type: SocketTriggerTypes;
    notificationData: unknown;
    namespace?: "chat" | "video";
}

export const triggerSocketEvent = async ({
    userId,
    type,
    notificationData,
    namespace = "chat",
}: TriggerSocketParams) => {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || process.env.SOCKET_SERVER_URL}/api/trigger-event`,
            {
                userId,
                type,
                notificationData,
                namespace,
            },
            {
                headers: {
                    "x-api-key": process.env.SOCKET_API_SECRET_KEY || process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY, 
                },
            }
        );

    } catch (err) {
        console.error("Error triggering socket event via Express:", err);
    }
};