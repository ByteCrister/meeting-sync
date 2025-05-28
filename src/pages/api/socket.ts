// src/pages/api/socket.ts

import { Server as ServerIO } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { SocketTriggerTypes, VMSocketTriggerTypes } from "@/utils/constants";
import {
    registerUserSocket,
    removeUserSocket,
} from "@/utils/socket/socketUserMap";
import { setIOInstance } from "@/utils/socket/setIOInstance";

import '../../utils/cron/updateSlotStatus';
import VideoCallModel, { IVideoCall, IVideoCallParticipant, IVideoCallSession } from "@/models/VideoCallModel";
import getUsersInRoom from "@/utils/server/getUsersInRoom";
import { calculateAndUpdateEngagement } from "@/utils/server/calculateAndUpdateEngagement";
import { getVideoUserIdBySocketId, getVideoUserSocketId, registerVideoUserSocket, removeVideoUserSocket } from "@/utils/socket/videoSocketUserMap";

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
            path: process.env.SOCKET_PATH! || '/api/socket',
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
        setIOInstance(io);  // Set the global Socket.IO instance
        socketServerInitialized = true;

        // ? CHAT/NOTIFICATION NAMESPACE HANDLER (if needed)
        const chatNamespace = io.of("/chat");

        chatNamespace.on("connection", (socket) => {
            console.log("[CHAT/NOTIFICATION] Socket connected:", socket.id);

            // ? Register a user to socket using userId
            socket.on(SocketTriggerTypes.REGISTER_USER, (data) => {
                console.log("-------------------------- User registered: ", data.userId + ' -----------------------------');
                registerUserSocket(data.userId, socket.id);
                socket.data.userId = data.userId;
            });

            socket.on('disconnect', () => {
                console.log(`[CHAT/NOTIFICATION] SOCKET Disconnected`);
                removeUserSocket(socket.data.userId);
            });

        });


        // ? VIDEO CALL NAMESPACE HANDLER
        const videoNamespace = io.of("/video");

        videoNamespace.on("connection", (socket) => {
            console.log("->> [VIDEO] Socket connected: ", socket.id);

            // * Video Meeting Socket Events
            socket.on(SocketTriggerTypes.LEAVE_ROOM, ({ roomId, userId }) => {
                socket.leave(roomId);
                socket.to(roomId).emit(SocketTriggerTypes.USER_LEAVED, { userId }); // <-- emit to all in the room
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

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.OFFER, ({ roomId, newUserId, offer }) => {
                const targetSocketId = getVideoUserSocketId(newUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_OFFER, {
                        fromUserId: socket.data.userId,
                        offer
                    });
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.ANSWER, ({ roomId, fromUserId, answer }) => {
                const targetSocketId = getVideoUserSocketId(fromUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_ANSWER, {
                        fromUserId: socket.data.userId,
                        answer
                    });
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.ICE_CANDIDATE, ({ roomId, targetUserId, candidate }) => {
                const targetSocketId = getVideoUserSocketId(targetUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, {
                        fromUserId: socket.data.userId,
                        candidate
                    });
                }
            });

            socket.on("disconnect", async () => {
                console.log("VIDEO SOCKET Disconnected: ", socket.id);
                const userId = getVideoUserIdBySocketId(socket.id);
                removeVideoUserSocket(socket.id);

                try {
                    const call: IVideoCall | null = await VideoCallModel.findOne({ "participants.socketId": socket.id });

                    if (call) {
                        // ? Skipping time of host
                        if (userId && userId.toString() === call.hostId.toString()) {
                            console.log("Host disconnected — skip updating participant session.");
                            return;
                        }
                        const roomId = call.meetingId.toString();
                        if (roomId && userId) {
                            socket.to(roomId).emit(VMSocketTriggerTypes.USER_LEAVED, { userId });
                        }

                        const participantIndex = call.participants.findIndex((p: IVideoCallParticipant) => p.socketId === socket.id);

                        if (participantIndex !== -1) {
                            const participant = call.participants[participantIndex];

                            // Find the last session with leftAt not set
                            const sessionIndex = participant.sessions.findIndex((s: IVideoCallSession) => !s.leftAt);
                            if (sessionIndex !== -1) {
                                const path = `participants.${participantIndex}.sessions.${sessionIndex}.leftAt`;

                                await VideoCallModel.updateOne(
                                    { _id: call._id },
                                    { $set: { [path]: new Date() } }
                                );
                                // Fetch the updated call document
                                const updatedCall = await VideoCallModel.findById(call._id);
                                if (updatedCall) {
                                    await calculateAndUpdateEngagement({
                                        ...updatedCall.toObject(),
                                        endTime: updatedCall.endTime || new Date(),
                                    });
                                }
                                console.log(`Updated leftAt for session of socket: ${socket.id}`);
                            } else {
                                console.log(`No open session found for socket: ${socket.id}`);
                            }
                        }
                    } else {
                        console.log(`No matching video call found for socket: ${socket.id}`);
                    }

                } catch (err) {
                    console.error("Error updating participant session leftAt:", err);
                }
            });

        });

    } else {
        console.log("**Socket.IO already running.**");
    }

    res.end();
};

export default ioHandler;