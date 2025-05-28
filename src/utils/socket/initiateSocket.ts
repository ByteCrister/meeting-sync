// src/utils/socket/initialSocket.ts

import { io, Socket } from "socket.io-client";

const sockets: Record<string, Socket> = {};

export const initiateSocket = (namespace: "chat" | "video" = "chat"): Socket => {
    if (!sockets[namespace]) {
        const socket = io(`${process.env.NEXT_PUBLIC_DOMAIN}/${namespace}`, {
            path: process.env.NEXT_PUBLIC_SOCKET_PATH || "/api/socket",
            withCredentials: true,
            transports: ["websocket"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log(`Socket [${namespace}] connected:`, socket.id);
        });

        socket.on("connect_error", (error) => {
            console.log(`Socket [${namespace}] connection error:`, error);
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket [${namespace}] disconnected:`, reason);
        });

        sockets[namespace] = socket;
    }

    return sockets[namespace];
};

export const getSocket = (namespace: "chat" | "video" = "chat"): Socket => {
    return initiateSocket(namespace);
};

export const disconnectSocket = (namespace: "chat" | "video" = "chat") => {
    if (sockets[namespace]) {
        sockets[namespace].disconnect();
        delete sockets[namespace];
    }
};