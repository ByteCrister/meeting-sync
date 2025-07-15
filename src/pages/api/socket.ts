// src/pages/api/socket.ts

import { Server as ServerIO } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { SocketTriggerTypes, VMSocketTriggerTypes } from "@/utils/constants";
import {
    registerUserSocket,
    removeUserSocket,
} from "@/utils/socket/socketUserMap";
import { setIOInstance } from "@/utils/socket/setIOInstance";

import "../../utils/cron/updateSlotStatus";
import getUsersInRoom from "@/utils/server/getUsersInRoom";
import {
    getVideoUserIdBySocketId,
    getVideoUserSocketId,
    registerVideoUserSocket,
    removeVideoUserSocket,
} from "@/utils/socket/videoSocketUserMap";
import { handleUserLeft } from "@/utils/server/handleUserLeft";

// Disable body parser for socket handling
export const config = {
    api: {
        bodyParser: false,
    },
};
let socketServerInitialized = false;

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer = (res.socket as unknown as { server: any }).server;

    if (!socketServerInitialized && httpServer && !httpServer.io) {
        console.log("Initializing new Socket.IO server...");

        // Initialize Socket.IO server
        const io = new ServerIO(httpServer, {
            path: process.env.SOCKET_PATH! || "/api/socket",
            pingInterval: 10000,
            pingTimeout: 20000,
            cors: {
                origin: process.env.SOCKET_SERVER_URL!,
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
        });

        // Attach the Socket.IO instance to the server object
        httpServer.io = io;
        setIOInstance(io); // Set the global Socket.IO instance
        socketServerInitialized = true;

        // ? CHAT/NOTIFICATION NAMESPACE HANDLER (if needed)
        const chatNamespace = io.of("/chat");

        chatNamespace.on("connection", (socket) => {
            console.log("[CHAT/NOTIFICATION] Socket connected:", socket.id);

            // ? Register a user to socket using userId
            socket.on(SocketTriggerTypes.REGISTER_USER, (data) => {
                console.log(`-------------------------- User registered: ${data.userId} -----------------------------`);
                registerUserSocket(data.userId, socket.id);
                socket.data.userId = data.userId;
            });

            socket.on("disconnect", () => {
                console.log(`[CHAT/NOTIFICATION] SOCKET Disconnected`);
                removeUserSocket(socket.data.userId);
            });
        });

        // ? VIDEO CALL NAMESPACE HANDLER
        const videoNamespace = io.of("/video");

        videoNamespace.on("connection", (socket) => {
            console.log("->> [VIDEO] Socket connected: ", socket.id);

            // * Video Meeting Socket Events
            socket.on(SocketTriggerTypes.LEAVE_ROOM, async ({ roomId, userId }) => {
                console.log(`\n\n[VIDEO] User ${userId} left room ${roomId}`);
                socket.leave(roomId);
                socket.to(roomId).emit(SocketTriggerTypes.USER_LEAVED, { userId });
            });

            // ? Joining a user to socket using meetingId/roomId
            socket.on(VMSocketTriggerTypes.JOIN_ROOM, async ({ roomId, userId }) => {
                socket.join(roomId);
                registerVideoUserSocket(userId, socket.id);
                socket.data.userId = userId;
                socket.data.roomId = roomId;

                const usersInRoom = await getUsersInRoom(roomId);
                const otherUserIds = usersInRoom.filter((id) => id !== userId);

                // Send existing users to the newly joined user
                socket.emit(VMSocketTriggerTypes.EXISTING_USERS, {
                    existingUsers: otherUserIds,
                });

                // Notify other users that a new user joined
                socket.to(roomId).emit(VMSocketTriggerTypes.USER_JOINED, {
                    newUserId: userId,
                });

                console.log(`[VIDEO] User ${userId} joined room ${roomId}`);
            });

            socket.on(VMSocketTriggerTypes.OFFER,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ({ roomId, fromUserId, targetUserId, offer }) => {
                    const targetSocketId = getVideoUserSocketId(targetUserId);
                    if (targetSocketId) {
                        socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_OFFER, {
                            fromUserId, // <- current user is sending offer
                            offer,
                        });
                    }
                }
            );

            socket.on(VMSocketTriggerTypes.ANSWER,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ({ roomId, fromUserId, targetUserId, answer }) => {
                    const targetSocketId = getVideoUserSocketId(targetUserId);
                    if (targetSocketId) {
                        socket
                            .to(targetSocketId)
                            .emit(VMSocketTriggerTypes.RECEIVE_ANSWER, {
                                fromUserId: socket.data.userId,
                                answer,
                            });
                    }
                }
            );

            socket.on(VMSocketTriggerTypes.ICE_CANDIDATE,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ({ roomId, targetUserId, candidate }) => {
                    const targetSocketId = getVideoUserSocketId(targetUserId);
                    if (targetSocketId) {
                        socket
                            .to(targetSocketId)
                            .emit(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, {
                                fromUserId: socket.data.userId,
                                candidate,
                            });
                    }
                }
            );

            socket.on("disconnect", async () => {
                console.log("VIDEO SOCKET Disconnected: ", socket.id);
                const userId = getVideoUserIdBySocketId(socket.id);
                removeVideoUserSocket(socket.id);
                if (userId) {
                    console.log(`\n\n[ User ${userId} disconnected from video call. Socket ID: ${socket.id}, Room ID: ${socket.data.roomId} ]\n`);
                    await handleUserLeft(userId, socket.data.roomId);
                }
                if (userId && socket.data.roomId) {
                    // * emit to user own room and clean up
                    socket
                        .to(socket.data.roomId)
                        .emit(VMSocketTriggerTypes.USER_LEAVED, { userId });
                    // * emit to all other users in the room to remove that user from their UI and redux
                    socket
                        .to(socket.data.roomId)
                        .emit(SocketTriggerTypes.USER_LEAVED, { userId });
                }
            });
        });
    } else {
        console.log("**Socket.IO already running.**");
    }

    res.end();
};

export default ioHandler;
