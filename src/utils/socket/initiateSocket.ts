// src/utils/socket/initialSocket.ts (next.js)

import { io, Socket } from "socket.io-client";

const sockets: Record<string, Socket> = {};

export const initiateSocket = (namespace: "chat" | "video"): Socket => {
    if (!sockets[namespace]) {
        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_IO_SERVER}/${namespace}`, {
            path: process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io",
            withCredentials: true,
            transports: ["websocket"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: false,
        });

        socket.on("connect", () => {
            console.log(`✅ Socket [${namespace}] connected:`, socket.id);
        });

        socket.on("connect_error", (error) => {
            console.warn(`⚠️ Socket [${namespace}] connection error:`, error);
        });

        socket.on("disconnect", (reason) => {
            console.warn(`🔌 Socket [${namespace}] disconnected:`, reason);
        });

        socket.on("reconnect", () => {
            console.log(`✅ Socket [${namespace}] reconnected`);
        });

        sockets[namespace] = socket;
    }

    return sockets[namespace];
};

export const getSocket = (namespace: "chat" | "video"): Socket => {
    return initiateSocket(namespace);
};

export const disconnectSocket = (namespace: "chat" | "video") => {
    if (sockets[namespace]) {
        sockets[namespace].disconnect();
        delete sockets[namespace];
    }
};