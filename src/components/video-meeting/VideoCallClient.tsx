"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { apiGetVideoCallStatus, apiJoinVideoCall, apiUpdateVideoCall, apiLeaveVideoCall } from "@/utils/client/api/api-video-meeting-call";
import { VideoCallErrorTypes, VMSocketTriggerTypes, SocketTriggerTypes, VCallUpdateApiType } from "@/utils/constants";
import { getSocket } from "@/utils/socket/initiateSocket";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import MeetingNotStarted from "../errors/MeetingNotStarted";
import FullPageError from "../errors/FullPageError";
import useVideoSocket from "@/hooks/useVideoSocket";
import {
    setMeetingDetails,
    VideoCallStatus,
    updateParticipant,
    endMeeting,
    VideoCallParticipant,
} from "@/lib/features/videoMeeting/videoMeetingSlice";
import { toast } from "sonner";
import { VideoCallErrorBoundary } from "./VideoCallErrorBoundary";
import { NetworkQualityIndicator } from "./NetworkQualityIndicator";
import { VideoParticipant } from "./VideoParticipant";
import { VideoControls } from "./VideoControls";
import { ChatSidebar } from "./ChatSidebar";
import { SettingsSidebar } from "./SettingsSidebar";
import { useRouter } from "next/navigation";


export default function VideoCallClient() {
    const dispatch = useAppDispatch();

    const searchParams = useSearchParams();
    const roomId = searchParams?.get("roomId");

    const userId = useAppSelector((state) => state.userStore.user?._id);
    const currentUser = useAppSelector(state => state.userStore.user);
    const meetingState = useAppSelector((state) => state.videoMeeting);

    const [isMuted, setIsMuted] = useState(false); // Audio is on by default
    const [isVideoOn, setIsVideoOn] = useState(true); // Video is on by default
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [networkQuality, setNetworkQuality] = useState<'good' | 'poor'>('good');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const router = useRouter();

    const localVideo = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
    const remoteStreamsRef = useRef<{ [userId: string]: MediaStream }>({});
    const [remoteUsers, setRemoteUsers] = useState<{ [userId: string]: MediaStream }>({});
    const [videoCallStatus, setVideoCallStatus] = useState<VideoCallErrorTypes | null>(null);
    const screenShareStreamRef = useRef<MediaStream | null>(null);

    useVideoSocket(roomId || "");

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

    useEffect(() => {
        const interval = setInterval(checkNetworkQuality, 5000);
        return () => clearInterval(interval);
    }, [checkNetworkQuality]);

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

    const startVideoCall = async () => {
        if (!roomId || !userId) return;

        try {
            setIsLoading(true);
            const videoCallStatusData = await apiGetVideoCallStatus(roomId);

            if (videoCallStatusData.isError) {
                setVideoCallStatus(videoCallStatusData.errorType);
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
                setVideoCallStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
                setIsLoading(false);
                return;
            }

            if (!socketRef.current) {
                socketRef.current = getSocket();
            }
            const socket = getSocket();
            socketRef.current = socket;

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;

            if (localVideo.current) localVideo.current.srcObject = stream;

            socket.emit(VMSocketTriggerTypes.JOIN_ROOM, { roomId, userId });

            socket.on(VMSocketTriggerTypes.EXISTING_USERS, async ({ users }) => {
                users.forEach(async (existingUserId: string) => {
                    if (existingUserId === userId) return;
                    const peer = createPeerConnection(existingUserId);
                    peersRef.current[existingUserId] = peer;

                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);

                    socket.emit(VMSocketTriggerTypes.OFFER, { roomId, newUserId: existingUserId, offer });
                });
            });

            const createPeerConnection = (targetUserId: string) => {
                console.log(targetUserId);
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
                    if (!remoteStreamsRef.current[targetUserId]) {
                        remoteStreamsRef.current[targetUserId] = new MediaStream();
                    }
                    remoteStreamsRef.current[targetUserId].addTrack(e.track);
                    setRemoteUsers((prev) => ({
                        ...prev,
                        [targetUserId]: remoteStreamsRef.current[targetUserId]
                    }));
                };

                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((track) => {
                        peer.addTrack(track, localStreamRef.current!);
                    });
                }

                return peer;
            };

            socket.on(VMSocketTriggerTypes.USER_JOINED, async ({ newUserId }) => {
                if (newUserId === userId) return;
                const peer = createPeerConnection(newUserId);
                peersRef.current[newUserId] = peer;

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);

                socket.emit(VMSocketTriggerTypes.OFFER, { roomId, newUserId, offer });
            });

            socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ fromUserId, offer }) => {
                const peer = createPeerConnection(fromUserId);
                peersRef.current[fromUserId] = peer;

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
                if (remoteStreamsRef.current[leftUserId]) {
                    delete remoteStreamsRef.current[leftUserId];
                }
                setRemoteUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[leftUserId];
                    return updated;
                });
            });

            socket.on('disconnect', () => {
                toast.error("Connection lost. Attempting to reconnect...");
                attemptReconnect();
            });

            setIsLoading(false);
        } catch (error) {
            console.error("Error starting video call:", error);
            setVideoCallStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        startVideoCall();

        return () => {
            socketRef.current?.disconnect();
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenShareStreamRef.current?.getTracks().forEach((t) => t.stop());
            Object.values(peersRef.current).forEach((peer) => peer.close());
            peersRef.current = {};
            remoteStreamsRef.current = {};
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, userId]);

    useEffect(() => {
        if (
            meetingState.status === VideoCallStatus.ACTIVE ||
            meetingState.status === VideoCallStatus.ENDED
        ) {
            console.log("Meeting status changed:", meetingState.status);
        }
    }, [meetingState.status]);

    const toggleMute = async () => {
        if (!localStreamRef.current) return;

        const audioTrack = localStreamRef.current.getAudioTracks()[0];

        if (audioTrack) {
            // Turn OFF: stop and remove audio track
            audioTrack.stop();
            localStreamRef.current.removeTrack(audioTrack);
            setIsMuted(true);
        } else {
            // Turn ON: get new audio track and add it
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newAudioTrack = newStream.getAudioTracks()[0];
            localStreamRef.current.addTrack(newAudioTrack);
            setIsMuted(false);
        }

        if (userId && roomId) {
            const objectBody = {
                type: VCallUpdateApiType.PARTICIPANTS_DATA,
                meetingId: roomId,
                data: {
                    userId,
                    isMuted: !audioTrack, // true if we just added, false if we just removed
                    isVideoOn,
                    isScreenSharing,
                }
            };
            await apiUpdateVideoCall(objectBody);
            dispatch(updateParticipant({ userId, isMuted: !audioTrack }));
        }
    };

    const toggleVideo = async () => {
        if (!localStreamRef.current) return;

        const videoTrack = localStreamRef.current.getVideoTracks()[0];

        if (videoTrack) {
            // Turn OFF: stop and remove video track
            videoTrack.stop();
            localStreamRef.current.removeTrack(videoTrack);
            setIsVideoOn(false);
        } else {
            // Turn ON: get new video track and add it
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newVideoTrack = newStream.getVideoTracks()[0];
            localStreamRef.current.addTrack(newVideoTrack);
            setIsVideoOn(true);
        }
        if (userId && roomId) {
            const objectBody = {
                type: VCallUpdateApiType.PARTICIPANTS_DATA,
                meetingId: roomId,
                data: {
                    userId,
                    isMuted,
                    isVideoOn: !isVideoOn,
                    isScreenSharing,
                }
            };
            await apiUpdateVideoCall(objectBody);
            dispatch(updateParticipant({ userId, isVideoOn: !isVideoOn }));
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenShareStreamRef.current = screenStream;
                const videoTrack = screenStream.getVideoTracks()[0];

                Object.values(peersRef.current).forEach((peer) => {
                    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });

                if (localVideo.current) {
                    localVideo.current.srcObject = screenStream;
                }

                videoTrack.onended = () => {
                    toggleScreenShare();
                };

                setIsScreenSharing(true);
                if (userId && roomId) {
                    const objectBody = {
                        type: VCallUpdateApiType.PARTICIPANTS_DATA,
                        meetingId: roomId,
                        data: {
                            userId,
                            isMuted,
                            isVideoOn,
                            isScreenSharing: true,
                        }
                    };
                    await apiUpdateVideoCall(objectBody);

                    dispatch(updateParticipant({ userId, isScreenSharing: true }));
                }
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                const videoTrack = stream.getVideoTracks()[0];

                Object.values(peersRef.current).forEach((peer) => {
                    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });

                if (localVideo.current) {
                    localVideo.current.srcObject = stream;
                }

                if (screenShareStreamRef.current) {
                    screenShareStreamRef.current.getTracks().forEach(track => track.stop());
                    screenShareStreamRef.current = null;
                }

                setIsScreenSharing(false);
                if (userId && roomId) {
                    const objectBody = {
                        type: VCallUpdateApiType.PARTICIPANTS_DATA,
                        meetingId: roomId,
                        data: {
                            userId,
                            isMuted,
                            isVideoOn,
                            isScreenSharing: false,
                        }
                    };
                    await apiUpdateVideoCall(objectBody);
                    dispatch(updateParticipant({ userId, isScreenSharing: false }));
                }
            }
        } catch (error) {
            console.error("Error toggling screen share:", error);
            toast.error("Failed to toggle screen sharing");
        }
    };

    const handleSendChatMessage = async (message: string) => {
        if (socketRef.current && roomId) {
            const objectBody = {
                type: VCallUpdateApiType.NEW_VIDEO_CHAT_MESSAGE,
                meetingId: roomId,
                data: { message }
            }
            await apiUpdateVideoCall(objectBody);
        }
    };

    const handleDeleteChatMessage = async (messageId: string) => {
        if (socketRef.current && roomId) {
            const objectBody = {
                type: VCallUpdateApiType.REMOVE_VIDEO_CHAT_MESSAGE,
                meetingId: roomId,
                data: { messageId }
            }
            await apiUpdateVideoCall(objectBody);
        }
    };

    const handleEndCall = async () => {
        if (roomId) {
            const resData = await apiLeaveVideoCall(roomId);
            if (resData.success) {
                dispatch(endMeeting(new Date().toISOString()));
                socketRef.current?.emit(SocketTriggerTypes.LEAVE_ROOM, { roomId, userId });
                router.back();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p>Connecting to meeting...</p>
                </div>
            </div>
        );
    }

    if (videoCallStatus === VideoCallErrorTypes.USER_NOT_FOUND) return <FullPageError message="User not found. Please try to signin again." />
    if (videoCallStatus === VideoCallErrorTypes.MEETING_NOT_FOUND) return <FullPageError message="Meeting is not valid. Meeting maybe removed or Room ID is incorrect." />
    if (videoCallStatus === VideoCallErrorTypes.MEETING_ENDED) return <FullPageError message="The meeting is ended." />
    if (videoCallStatus === VideoCallErrorTypes.USER_NOT_PARTICIPANT) return <FullPageError message="You did not booked this meeting." />
    if (videoCallStatus === VideoCallErrorTypes.USER_ALREADY_JOINED) return <FullPageError message="You are already joined in this meeting." />
    if (meetingState.status === VideoCallStatus.WAITING) return <MeetingNotStarted />

    return (
        <VideoCallErrorBoundary>
            <div className="flex h-screen bg-gray-900 text-white">
                <NetworkQualityIndicator quality={networkQuality} />

                {/* Main Video Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* Local Video */}
                            {localStreamRef.current && (
                                <VideoParticipant
                                    stream={localStreamRef.current}
                                    participant={meetingState.participants.find((p: VideoCallParticipant) => p.userId === userId) || {
                                        userId: currentUser?._id || '',
                                        username: currentUser?.username || '',
                                        image: currentUser?.image || '',
                                        socketId: '',
                                        isMuted,
                                        isVideoOn,
                                        isScreenSharing,
                                        sessions: []
                                    }}
                                    isLocal
                                />
                            )}

                            {/* Remote Videos */}
                            {Object.entries(remoteUsers).map(([id, stream]) => {
                                const participant = meetingState.participants.find((p: VideoCallParticipant) => p.userId === id);
                                if (!participant) return null;
                                return (
                                    <VideoParticipant
                                        key={id}
                                        stream={stream}
                                        participant={participant}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <VideoControls
                        isHost={meetingState.hostId === userId}
                        isMuted={isMuted}
                        isVideoOn={isVideoOn}
                        isScreenSharing={isScreenSharing}
                        showChat={showChat}
                        showSettings={showSettings}
                        onToggleMute={toggleMute}
                        onToggleVideo={toggleVideo}
                        onToggleScreenShare={toggleScreenShare}
                        onToggleChat={() => setShowChat(!showChat)}
                        onToggleSettings={() => setShowSettings(!showSettings)}
                        onEndCall={handleEndCall}
                    />
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <ChatSidebar
                        currentUserId={userId ?? ""}
                        isChatAllowed={meetingState.settings.allowChat}
                        messages={meetingState.chatMessages}
                        participants={meetingState.participants}
                        onSendMessage={handleSendChatMessage}
                        onDeleteMessage={handleDeleteChatMessage}
                    />
                )}

                {/* Settings Sidebar Just fo the Meeting Creator */}
                {(meetingState.hostId === userId) && showSettings && (
                    <SettingsSidebar
                        settings={meetingState.settings}
                        onUpdateSettings={async (settings) => {
                            // ? Setting can change only by the Host
                            if (meetingState.hostId.toString() === userId?.toString()) {
                                const objectBody = {
                                    type: VCallUpdateApiType.HOST_SETTING,
                                    meetingId: roomId || "",
                                    data: settings
                                };

                                await apiUpdateVideoCall(objectBody);
                            }
                        }}
                    />
                )}
            </div>
        </VideoCallErrorBoundary>
    );
}
