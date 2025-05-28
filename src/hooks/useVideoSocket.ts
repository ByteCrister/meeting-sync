"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSocket, initiateSocket } from "@/utils/socket/initiateSocket";
import { SocketTriggerTypes, VideoCallErrorTypes, VMSocketTriggerTypes } from "@/utils/constants";
import {
    addChatMessage,
    addParticipant,
    removeChatMessage,
    removeParticipant,
    setMeetingDetails,
    setVideoCallStatus,
    updateSettings,
    VideoCallStatus,
} from "@/lib/features/videoMeeting/videoMeetingSlice";
import ShadcnToast from "@/components/global-ui/toastify-toaster/ShadcnToast";
import { toast } from "sonner";
import { apiGetVideoCallStatus, apiJoinVideoCall } from "@/utils/client/api/api-video-meeting-call";

const useVideoSocket = (roomId: string) => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.userStore.user?._id);
    const socketRef = useRef<ReturnType<typeof initiateSocket> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [videoCallStatus, setVideoStatus] = useState<VideoCallErrorTypes | null>(null);

    const [networkQuality, setNetworkQuality] = useState<'good' | 'poor'>('good');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const localVideo = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
    const remoteStreamsRef = useRef<{ [userId: string]: MediaStream }>({});
    const [remoteUsers, setRemoteUsers] = useState<{
        [userId: string]: MediaStream;
    }>({});
    const screenShareStreamRef = useRef<MediaStream | null>(null);

    // Reconnection logic
    const attemptReconnect = useCallback(async () => {
        if (reconnectAttempts >= 3) {
            toast.error("Failed to reconnect after multiple attempts");
            return;
        }

        try {
            setReconnectAttempts(prev => prev + 1);
            await startVideoCall();
            setReconnectAttempts(0);
            toast.success("Successfully reconnected");
        } catch (error) {
            console.error("Reconnection failed:", error);
            setTimeout(attemptReconnect, 5000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reconnectAttempts]);

    // Network quality monitoring
    const checkNetworkQuality = useCallback(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;
        const pingStart = Date.now();

        socket.emit('ping', () => {
            const pingTime = Date.now() - pingStart;
            setNetworkQuality(pingTime < 100 ? 'good' : 'poor');
        });
    }, []);

    const startVideoCall = async () => {

        try {
            setIsLoading(true);
            const videoCallStatusData = await apiGetVideoCallStatus(roomId);

            if (videoCallStatusData.isError) {
                setVideoStatus(videoCallStatusData.errorType);
                setIsLoading(false);
                return;
            }

            const joinStatusData = await apiJoinVideoCall(roomId);
            if (joinStatusData.success && joinStatusData?.meetingStatus === VideoCallStatus.WAITING) {
                setIsLoading(false);
                return;
            } else if (joinStatusData.success && joinStatusData?.meeting) {
                dispatch(setMeetingDetails(joinStatusData.meeting));
            } else if (!joinStatusData.success) {
                setVideoStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
                setIsLoading(false);
                return;
            }

            if (!socketRef.current) {
                socketRef.current = getSocket();
            }
            const socket = socketRef.current;

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;

            if (localVideo.current) localVideo.current.srcObject = stream;

            if (socket.hasListeners(VMSocketTriggerTypes.EXISTING_USERS)) return;

            const createPeerConnection = (targetUserId: string) => {
                const peer = new RTCPeerConnection({
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                        { urls: "stun:stun2.l.google.com:19302" }
                    ]
                });

                peer.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit(VMSocketTriggerTypes.ICE_CANDIDATE, {
                            roomId,
                            targetUserId,
                            candidate: e.candidate
                        });
                    }
                };

                peer.onconnectionstatechange = () => {
                    if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
                        attemptReconnect();
                    }
                };

                peer.ontrack = (e) => {
                    const remoteStream = remoteStreamsRef.current[targetUserId] ?? new MediaStream();
                    remoteStreamsRef.current[targetUserId] = remoteStream;

                    remoteStream.addTrack(e.track);

                    // Update only when both video and audio are present
                    if (remoteStream.getTracks().length >= 2) {
                        setRemoteUsers((prev) => ({
                            ...prev,
                            [targetUserId]: remoteStream,
                        }));
                    }
                };


                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((track) => {
                        peer.addTrack(track, localStreamRef.current!);
                    });
                }

                return peer;
            };

            socket.emit(VMSocketTriggerTypes.JOIN_ROOM, { roomId, userId });

            // On EXISTING_USERS: **Joining user** creates offers to existing participants
            socket.on(VMSocketTriggerTypes.EXISTING_USERS, async ({ users }) => {
                const updates: { [id: string]: MediaStream } = {};

                for (const existingUserId of users) {
                    if (existingUserId === userId) continue;

                    if (!peersRef.current[existingUserId]) {
                        const peer = createPeerConnection(existingUserId);
                        peersRef.current[existingUserId] = peer;

                        const offer = await peer.createOffer();
                        await peer.setLocalDescription(offer);

                        socket.emit(VMSocketTriggerTypes.OFFER, { roomId, newUserId: existingUserId, offer });

                        updates[existingUserId] = new MediaStream();
                    }
                }

                setRemoteUsers(prev => ({ ...prev, ...updates }));
            });

            // On USER_JOINED: **Existing users do NOT create offers**,
            // only create peer connection and wait for offer from new user.
            socket.on(VMSocketTriggerTypes.USER_JOINED, ({ newUserId }) => {
                if (newUserId === userId) return;

                // Only create peer connection, DO NOT create offer
                if (!peersRef.current[newUserId]) {
                    const peer = createPeerConnection(newUserId);
                    peersRef.current[newUserId] = peer;

                    setRemoteUsers(prev => ({
                        ...prev,
                        [newUserId]: new MediaStream(),
                    }));
                }
            });

            socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ fromUserId, offer }) => {
                let peer = peersRef.current[fromUserId];

                if (!peer) {
                    peer = createPeerConnection(fromUserId);
                    peersRef.current[fromUserId] = peer;
                }

                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit(VMSocketTriggerTypes.ANSWER, { roomId, fromUserId, answer });
            });

            socket.on(VMSocketTriggerTypes.RECEIVE_ANSWER, async ({ fromUserId, answer }) => {
                const peer = peersRef.current[fromUserId];
                await peer?.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, async ({ fromUserId, candidate }) => {
                const peer = peersRef.current[fromUserId];
                await peer?.addIceCandidate(new RTCIceCandidate(candidate));
            });

            socket.on(VMSocketTriggerTypes.USER_LEAVED, ({ userId: leftUserId }) => {
                // Remove peer connection
                if (peersRef.current[leftUserId]) {
                    peersRef.current[leftUserId].close();
                    delete peersRef.current[leftUserId];
                }
                // Remove remote stream
                // Stop all media tracks from the remote stream
                if (remoteStreamsRef.current[leftUserId]) {
                    remoteStreamsRef.current[leftUserId].getTracks().forEach((track) => track.stop());
                    delete remoteStreamsRef.current[leftUserId];
                }
                setRemoteUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[leftUserId];
                    return updated;
                });
            });

            setIsLoading(false);
        } catch (error) {
            console.error("Error starting video call:", error);
            setVideoStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(checkNetworkQuality, 5000);
        return () => clearInterval(interval);
    }, [checkNetworkQuality]);

    useEffect(() => {
        if (!userId || !roomId) return;

        setupVideoSocket();
        return () => endCall();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, roomId]);

    // Set up video call state managements
    const setupVideoSocket = async () => {
        if (!socketRef.current) {
            socketRef.current = getSocket();
        }

        const socket = socketRef.current;

        if (socket.disconnected) {
            socket.connect();
        }

        // Cleanup all existing listeners
        socket.removeAllListeners();


        // ! ----------- Mange States in Redux ---------------
        // Event: Host joined
        socket.on(SocketTriggerTypes.HOST_JOINED, () => {
            ShadcnToast("Host just joined the meeting.");
            dispatch(setVideoCallStatus(VideoCallStatus.ACTIVE));
        });

        // Event: New participant joined
        socket.on(SocketTriggerTypes.NEW_PARTICIPANT_JOINED, (data) => {
            dispatch(addParticipant(data));
        });

        // Event: New chat message
        socket.on(SocketTriggerTypes.NEW_METING_CHAT_MESSAGE, (data) => {
            dispatch(addChatMessage(data));
        });

        // Event: Chat message deleted
        socket.on(SocketTriggerTypes.DELETE_METING_CHAT_MESSAGE, ({ _id }) => {
            dispatch(removeChatMessage(_id));
        });

        // Event: Meeting settings updated
        socket.on(SocketTriggerTypes.CHANGE_MEETING_SETTING, (data) => {
            dispatch(updateSettings(data));
        });

        // Event: A user left
        socket.on(SocketTriggerTypes.USER_LEAVED, ({ userId }) => {
            dispatch(removeParticipant(userId));
        });

        // Event: Meeting ended
        socket.on(SocketTriggerTypes.MEETING_ENDED, () => {
            dispatch(setVideoCallStatus(VideoCallStatus.ENDED));
            ShadcnToast("Meeting has ended.");
        });

        // Debug: Socket disconnected
        socket.on("disconnect", (reason) => {
            console.log("Video socket disconnected:", reason);
            toast.error("Connection lost. Attempting to reconnect...");
            attemptReconnect();
        });
    };

    // cleanup connections, stop tracks, etc.
    const endCall = () => {
        const socket = socketRef.current;
        // Copy the ref value to a variable to avoid stale closure issues
        const localStream = localStreamRef.current;
        const screenShareStream = screenShareStreamRef.current;
        if (socket) {
            socket.emit(SocketTriggerTypes.LEAVE_ROOM, {
                roomId,
                userId,
            });
            socket.removeAllListeners();
            socket.disconnect();
            localStream?.getTracks().forEach((t) => t.stop());
            screenShareStream?.getTracks().forEach((t) => t.stop());
            Object.values(peersRef.current).forEach((peer) => peer.close());
            peersRef.current = {};
            remoteStreamsRef.current = {};
            console.log("Video socket cleanup: disconnected");
        }
        socketRef.current = null;
    };

    return {
        isLoading,
        socketRef,
        videoCallStatus,
        networkQuality,
        localVideo,
        localStreamRef,
        remoteUsers,
        peersRef,
        screenShareStreamRef,
        startVideoCall,
    };
};


export default useVideoSocket;