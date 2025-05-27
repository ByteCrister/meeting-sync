// src/pages/api/socket/socket.ts

import { Server as ServerIO } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { SocketTriggerTypes, VMSocketTriggerTypes } from "@/utils/constants";
import {
    getUserIdBySocketId,
    getUserSocketId,
    // getUserIdBySocketId,
    // getUserSocketId,
    registerUserSocket,
    removeUserSocket,
} from "@/utils/socket/socketUserMap";
import { setIOInstance } from "@/utils/socket/setIOInstance";

import '../../utils/cron/updateSlotStatus';
import VideoCallModel, { IVideoCall, IVideoCallParticipant, IVideoCallSession } from "@/models/VideoCallModel";
import getUsersInRoom from "@/utils/server/getUsersInRoom";
import { calculateAndUpdateEngagement } from "@/utils/server/calculateAndUpdateEngagement";
// import { removeParticipantFromAllCalls } from "@/utils/server/removeParticipantFromCall";

// Disable body parser for socket handling
export const config = {
    api: {
        bodyParser: false,
    },
};
let socketServerInitialized = false;

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // Access the extended http.Server which includes io
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer = (res.socket as unknown as { server: any }).server;

    if (!socketServerInitialized && httpServer && !httpServer.io) {
        console.log("Initializing new Socket.IO server...");

        // Initialize the Socket.IO server
        const io = new ServerIO(httpServer, {
            path: process.env.SOCKET_PATH! || '/api/socket',
            pingInterval: 10000, // every 10 seconds
            pingTimeout: 20000, // wait 20s before killing socket
            cors: {
                origin: process.env.SOCKET_SERVER_URL!,
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true, // Allow cookies to be sent with requests
            },
        });

        // Attach the Socket.IO instance to the server object
        httpServer.io = io;
        setIOInstance(io);  // Set the global Socket.IO instance
        socketServerInitialized = true;

        // Socket.IO connection handling
        io.on("connection", (socket) => {
            console.log("->> Socket connected:", socket.id);

            // ? Register a user to socket using userId
            socket.on(SocketTriggerTypes.REGISTER_USER, (data) => {
                console.log("-------------------------- User registered: ", data.userId + ' -----------------------------');
                registerUserSocket(data.userId, socket.id);
            });

            socket.on("disconnect", async () => {
                console.log("__Socket disconnected:", socket.id);
                const userId = getUserIdBySocketId(socket.id);
                removeUserSocket(socket.id);

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


            // * Video Meeting Socket Events
            socket.on(SocketTriggerTypes.LEAVE_ROOM, ({ roomId, userId }) => {
                socket.leave(roomId);
                socket.emit(SocketTriggerTypes.USER_LEAVED, { userId }); // <-- emit to all in the room
            });

            // ? Joining a user to socket using meetingId/roomId
            socket.on(VMSocketTriggerTypes.JOIN_ROOM, async ({ roomId, userId }) => {
                socket.join(roomId);

                const usersInRoom = await getUsersInRoom(roomId);

                // Emit list of existing users (excluding the new joiner) back to the new user
                socket.to(roomId).emit(VMSocketTriggerTypes.EXISTING_USERS, {
                    users: usersInRoom.filter((id) => id !== userId),
                });

                // Notify others in the room about the new user
                socket.to(roomId).emit(VMSocketTriggerTypes.USER_JOINED, { newUserId: userId });
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.OFFER, ({ roomId, newUserId, offer }) => {
                const targetSocketId = getUserSocketId(newUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_OFFER, { fromUserId: socket.data.userId, offer });
                }
                // socket.to(roomId).emit(VMSocketTriggerTypes.RECEIVE_OFFER, { fromUserId: newUserId, offer });
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.ANSWER, ({ roomId, fromUserId, answer }) => {
                const targetSocketId = getUserSocketId(fromUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_ANSWER, { fromUserId, answer });
                }
                // socket.to(roomId).emit(VMSocketTriggerTypes.RECEIVE_ANSWER, { fromUserId, answer });
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            socket.on(VMSocketTriggerTypes.ICE_CANDIDATE, ({ roomId, targetUserId, candidate }) => {
                const targetSocketId = getUserSocketId(targetUserId);
                if (targetSocketId) {
                    socket.to(targetSocketId).emit(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, { fromUserId: targetUserId, candidate });
                }
                // socket.to(roomId).emit(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, { fromUserId: targetUserId, candidate });
            });
        });
    } else {
        console.log("**Socket.IO already running.**");
    }

    res.end();
};

export default ioHandler;