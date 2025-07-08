'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaStreamErrorTypes, SocketTriggerTypes, VideoCallErrorTypes, VMSocketTriggerTypes } from '@/utils/constants';
import { getSocket } from '@/utils/socket/initiateSocket';
import { getClonedMediaStream, stopBaseStream } from '@/utils/media/mediaStreamManager';
import { useAppDispatch } from '@/lib/hooks';
import { apiGetVideoCallStatus, apiJoinVideoCall, apiLeaveVideoCall } from '@/utils/client/api/api-video-meeting-call';
import { addChatMessage, addParticipant, endMeeting, removeChatMessage, removeParticipant, setMeetingDetails, setVideoCallStatus, updateSettings, VideoCallStatus } from '@/lib/features/videoMeeting/videoMeetingSlice';
import ShadcnToast from '@/components/global-ui/toastify-toaster/ShadcnToast';

const servers: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type PeerMap = Record<string, RTCPeerConnection>;
type CandQueue = Record<string, RTCIceCandidateInit[]>;
type RemoteStreamMap = Record<string, MediaStream>;

export const useVideoCall = (roomId: string, userId: string) => {
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
    const localRef = useRef<HTMLVideoElement | null>(null);
    const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnections = useRef<PeerMap>({});
    const pendingCandidates = useRef<CandQueue>({});
    const [remoteStreams, setRemoteStreams] = useState<RemoteStreamMap>({});
    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStream = useRef<MediaStream | null>(null);
    const [selectedCardVideo, setSelectedCardVideo] = useState<null | MediaStream>(null);
    const negotiationInProgress = useRef<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [videoStatus, setVideoStatus] = useState<VideoCallErrorTypes | null>(null); // For video call status (error or success)
    const [mediaPermissionError, setMediaPermissionError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    // callback ref that always sets srcObject for us:
    const localVideoRef = useCallback((el: HTMLVideoElement | null) => {
        localRef.current = el;
        if (el && localStream.current) {
            el.srcObject = localStream.current;
        }
    }, []);

    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
                result.onchange = () => {
                    if (result.state === 'granted') {
                        window.location.reload();
                    }
                };
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                console.warn('Permission API not supported');
            }
        };
        checkCameraPermission();
    }, []);

    const setupPeerConnection = (otherId: string) => {
        // Always clean old connection first (even if missed before)
        if (peerConnections.current[otherId]) {
            console.warn(`[PC CLEANUP] Closing stale peer for ${otherId}`);
            peerConnections.current[otherId].close();
            delete peerConnections.current[otherId];
        }

        const pc = new RTCPeerConnection(servers);
        if (localStream.current) {
            // Add audio track first if exists
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                pc.addTrack(audioTrack, localStream.current);
            }
            // Then add video track if exists
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                pc.addTrack(videoTrack, localStream.current);
            }
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current?.emit(VMSocketTriggerTypes.ICE_CANDIDATE, {
                    roomId,
                    targetUserId: otherId,
                    candidate: e.candidate.toJSON(),
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`[TRACK] Track received from ${otherId}`, event.track);

            setRemoteStreams(prev => {
                const existing = prev[otherId] || new MediaStream();
                const alreadyAdded = existing.getTracks().some(track => track.id === event.track.id);
                if (alreadyAdded) return prev;

                existing.addTrack(event.track);
                // Auto-select this stream on first arrival
                setSelectedCardVideo(existing);
                return { ...prev, [otherId]: existing };
            });
        };

        pc.onsignalingstatechange = () => {
            console.log(`[SIGNALING STATE - ${otherId}]`, pc.signalingState);
        };

        pc.onnegotiationneeded = async () => {
            if (negotiationInProgress.current[otherId]) {
                console.log(`[NEGOTIATION] Negotiation already in progress for ${otherId}, skipping`);
                return;
            }
            negotiationInProgress.current[otherId] = true;

            try {
                console.log(`[NEGOTIATION] Starting negotiation for ${otherId}, signalingState: ${pc.signalingState}`);

                // If signalingState is not stable, rollback first
                if (pc.signalingState !== 'stable') {
                    console.log(`[NEGOTIATION] signalingState is ${pc.signalingState}, performing rollback`);
                    await pc.setLocalDescription({ type: 'rollback' });

                    // Poll signalingState until stable or timeout
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => reject(new Error('Rollback timed out')), 5000);

                        const checkState = () => {
                            if (pc.signalingState === 'stable') {
                                clearTimeout(timeout);
                                resolve();
                            } else {
                                setTimeout(checkState, 100);
                            }
                        };
                        checkState();
                    });
                    console.log(`[NEGOTIATION] Rollback complete, signalingState now: ${pc.signalingState}`);
                }

                // Only create offer if stable after rollback
                if (pc.signalingState === 'stable') {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socketRef.current?.emit(VMSocketTriggerTypes.OFFER, {
                        roomId,
                        fromUserId: userId,
                        targetUserId: otherId,
                        offer,
                    });
                    console.log(`[OFFER] Sent offer to ${otherId}`);
                } else {
                    console.warn(`[NEGOTIATION] signalingState not stable after rollback, skipping offer`);
                }
            } catch (err) {
                console.error(`[NEGOTIATION ERROR] for ${otherId}:`, err);
            } finally {
                negotiationInProgress.current[otherId] = false;
            }
        };

        peerConnections.current[otherId] = pc;
        return pc;
    };


    useEffect(() => {

        const joinRoom = async () => {
            try {

                // 1. API Call to get video call status
                const videoCallStatusData = await apiGetVideoCallStatus(roomId);
                if (videoCallStatusData.isError) {
                    setVideoStatus(videoCallStatusData.errorType);
                    setIsLoading(false);
                    return;
                }
                // 2. API Call to join the video call
                const joinStatusData = await apiJoinVideoCall(roomId);
                if (joinStatusData.success && joinStatusData?.meetingStatus === VideoCallStatus.WAITING) {
                    setIsLoading(false);
                    return;
                } else if (joinStatusData.success && joinStatusData?.meeting) {
                    dispatch(setMeetingDetails(joinStatusData.meeting));
                    setIsLoading(false);
                } else if (!joinStatusData.success) {
                    setVideoStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
                    setIsLoading(false);
                    return;
                }

                if (!localRef.current) {
                    console.log("Local video element not set yet.");
                }

                // 1. Ensure local stream
                if (!localStream.current) {
                    try {
                        const clonedStream = await getClonedMediaStream();
                        localStream.current = clonedStream;
                        setLocalStreamState(clonedStream);
                    } catch (err: unknown) {
                        if (typeof err === 'object' && err !== null && 'message' in err) {
                            const message = (err as { message: string }).message;

                            if (message === 'camera-permission-denied') {
                                setMediaPermissionError(MediaStreamErrorTypes.CAMERA_PERMISSION_DENIED);
                                console.error('Camera permission denied:', message);
                                return;
                            }
                            if (message === 'microphone-permission-denied') {
                                setMediaPermissionError(MediaStreamErrorTypes.MIC_PERMISSION_DENIED);
                                return;
                            }
                        }
                        setVideoStatus(VideoCallErrorTypes.MEDIA_ERROR);
                        return;
                    }
                }

                // 2. Wait until <video> ref is mounted and bound
                await new Promise<void>((resolve) => {
                    const check = () => {
                        if (localRef.current && localRef.current.srcObject) resolve();
                        else setTimeout(check, 50);
                    };
                    check();
                });

                // 3. Now connect socket
                if (!socketRef.current) {
                    socketRef.current = getSocket('video');
                }
                const socket = socketRef.current;

                // FORCIBLY RECONNECT SOCKET (important)
                if (!socket.connected) {
                    socket.connect(); // This is REQUIRED to re-initiate a fresh connection
                }

                await new Promise<void>((resolve, reject) => {
                    if (socket.connected) return resolve();

                    const onConnect = () => {
                        socket.off("connect", onConnect);
                        socket.off("connect_error", onError);
                        resolve();
                    };

                    const onError = (err: unknown) => {
                        socket.off("connect", onConnect);
                        socket.off("connect_error", onError);
                        reject(err);
                    };

                    socket.on("connect", onConnect);
                    socket.on("connect_error", onError);

                    // Safety timeout
                    setTimeout(() => {
                        socket.off("connect", onConnect);
                        socket.off("connect_error", onError);
                        reject(new Error("Socket connection timeout"));
                    }, 5000);
                });

                console.log('[SOCKET] Connecting to video namespace...');

                socket.on(VMSocketTriggerTypes.EXISTING_USERS, async ({ existingUsers }) => {
                    console.log(`[EXISTING_USERS] Received:`, existingUsers);
                    for (const other of existingUsers) {
                        setupPeerConnection(other);
                        console.log(`[PC SETUP] for ${other}`);

                        Object.entries(peerConnections.current).forEach(([id, pc]) => {
                            console.log(`Peer ${id}:`, {
                                signaling: pc.signalingState,
                                ice: pc.iceConnectionState,
                                connection: pc.connectionState,
                            });
                        });
                    }
                });

                socket.on(VMSocketTriggerTypes.USER_JOINED, async ({ newUserId }) => {
                    // ✅ CLEANUP old state if user is rejoining
                    if (peerConnections.current[newUserId]) {
                        console.warn(`[REJOIN DETECTED] Cleaning up stale peer connection for ${newUserId}`);
                        peerConnections.current[newUserId].close();
                        delete peerConnections.current[newUserId];
                    }
                    if (negotiationInProgress.current[newUserId]) {
                        delete negotiationInProgress.current[newUserId];
                    }
                    if (pendingCandidates.current[newUserId]) {
                        delete pendingCandidates.current[newUserId];
                    }
                    setRemoteStreams(prev => {
                        const updated = { ...prev };
                        delete updated[newUserId];
                        return updated;
                    });

                    // ✅ Setup fresh peer connection
                    setupPeerConnection(newUserId);
                    console.log(`[USER JOINED] ${newUserId} joined.`);
                });

                socket.on(VMSocketTriggerTypes.RECEIVE_ANSWER, async ({ fromUserId, answer }) => {
                    console.log(`[RECEIVE_ANSWER] from ${fromUserId}`);
                    const pc = peerConnections.current[fromUserId];
                    if (!pc) return;

                    try {
                        if (!pc.remoteDescription || pc.signalingState === 'have-local-offer') {
                            await pc.setRemoteDescription(new RTCSessionDescription(answer));
                            console.log(`[ANSWER] Applied from ${fromUserId}`, answer);

                            (pendingCandidates.current[fromUserId] || []).forEach((cand) =>
                                pc.addIceCandidate(cand).catch(console.warn)
                            );
                            delete pendingCandidates.current[fromUserId];

                        } else {
                            console.warn(`Remote description already set or signalingState not valid for ${fromUserId}`);
                        }
                    } catch (err) {
                        console.error("Error setting remote answer:", err);
                    }
                }
                );

                socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ fromUserId, offer }) => {
                    let pc = peerConnections.current[fromUserId];
                    if (!pc) {
                        pc = setupPeerConnection(fromUserId);
                    }

                    if (negotiationInProgress.current[fromUserId]) {
                        console.log(`[OFFER] Negotiation already in progress for ${fromUserId}, ignoring incoming offer to avoid flood.`);
                        return;
                    }

                    negotiationInProgress.current[fromUserId] = true;

                    try {
                        const offerDesc = new RTCSessionDescription(offer);

                        if (pc.signalingState === "have-local-offer") {
                            console.warn(`[OFFER] signalingState have-local-offer, rolling back`);
                            await pc.setLocalDescription({ type: "rollback" });

                            // Poll signalingState to stable after rollback
                            await new Promise<void>((resolve, reject) => {
                                const timeout = setTimeout(() => reject(new Error('Rollback timed out')), 5000);
                                const checkState = () => {
                                    if (pc.signalingState === 'stable') {
                                        clearTimeout(timeout);
                                        resolve();
                                    } else {
                                        setTimeout(checkState, 100);
                                    }
                                };
                                checkState();
                            });
                        } else if (pc.signalingState !== "stable") {
                            console.warn(`[OFFER] signalingState not stable: ${pc.signalingState}. Ignoring offer.`);
                            return;
                        }

                        await pc.setRemoteDescription(offerDesc);
                        console.log(`[OFFER] Remote description set for ${fromUserId}`);

                        if ((pc.signalingState as string) === "have-remote-offer") {
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            socket.emit(VMSocketTriggerTypes.ANSWER, {
                                roomId,
                                fromUserId: userId,
                                targetUserId: fromUserId,
                                answer,
                            });

                            console.log(`[ANSWER] Sent answer to ${fromUserId}`);
                        } else {
                            console.warn(`[${fromUserId}] Not in 'have-remote-offer' state, skipping answer`);
                        }
                    } catch (err) {
                        console.error("Error handling received offer:", err);
                    } finally {
                        negotiationInProgress.current[fromUserId] = false;
                    }
                });

                socket.on(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE,
                    async ({ fromUserId, candidate }) => {
                        const pc = peerConnections.current[fromUserId];
                        const init = candidate as RTCIceCandidateInit;

                        if (pc && pc.remoteDescription) {
                            await pc.addIceCandidate(init).catch(console.warn);
                        } else {
                            pendingCandidates.current[fromUserId] ||= [];
                            pendingCandidates.current[fromUserId].push(init);
                        }
                    }
                );

                socket.emit(VMSocketTriggerTypes.JOIN_ROOM, { roomId, userId }, (result: unknown) => {
                    console.log('[JOIN ROOM RESULT]', result);
                });

                socket.on(VMSocketTriggerTypes.USER_LEAVED,
                    ({ userId: leaver }) => {
                        const pc = peerConnections.current[leaver];
                        if (pc) {
                            pc.close();
                            delete peerConnections.current[leaver];
                            delete negotiationInProgress.current[leaver];
                        }

                        setRemoteStreams((prev) => {
                            const next = { ...prev };
                            delete next[leaver];
                            return next;
                        });
                    }
                );

                // ! ----------- Mange States in Redux ---------------
                // Event: Host joined
                socket.on(SocketTriggerTypes.HOST_JOINED, () => {
                    ShadcnToast("Host just joined the meeting.");
                    window.location.reload();
                    // dispatch(setVideoCallStatus(VideoCallStatus.ACTIVE));
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
                    console.log(`[USER LEAVED] User ${userId} left the meeting`);
                    dispatch(removeParticipant(userId));
                });

                // Event: Meeting ended
                socket.on(SocketTriggerTypes.MEETING_ENDED, () => {
                    dispatch(setVideoCallStatus(VideoCallStatus.ENDED));
                    ShadcnToast("Meeting has ended.");
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.replace('/');
                    }
                });
                socket.on(SocketTriggerTypes.RUNNING_VIDEO_MEETING_CANCELLED, () => {
                    ShadcnToast("Meeting has been cancelled by the host.");
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        window.location.replace('/');
                    }
                });
                setIsLoading(false); // End loading after socket and WebRTC setup

            } catch (err) {
                setVideoStatus(VideoCallErrorTypes.MEDIA_ERROR);
                console.error('Media setup failed:', err);
            } finally {
                setIsLoading(false); // Ensure loading state is reset even on error
            }
        };

        joinRoom();

        return () => {
            const socket = socketRef.current;

            // Inform server before disconnecting
            if (socket?.connected) {
                socket.emit(SocketTriggerTypes.LEAVE_ROOM, { roomId, userId });
            }

            socket?.disconnect();
            socketRef.current = null;
            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
            negotiationInProgress.current = {};
            localStream.current?.getTracks().forEach(track => track.stop());
            localStream.current = null;
            setLocalStreamState(null);
            screenStream.current?.getTracks().forEach(track => track.stop());
            screenStream.current = null;
            setRemoteStreams({});
            localRef.current = null;
            stopBaseStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, userId]);

    useEffect(() => {
        const handleLeave = () => {
            const socket = socketRef.current;
            if (socket?.connected) {
                socket.emit(SocketTriggerTypes.LEAVE_ROOM, { roomId, userId });
            }
        };

        window.addEventListener('beforeunload', handleLeave);

        return () => {
            handleLeave();
            window.removeEventListener('beforeunload', handleLeave);
        };
    }, [roomId, userId]);

    useEffect(() => {
        if (localRef.current && localStreamState) {
            localRef.current.srcObject = localStreamState;
        }
    }, [localStreamState]);


    const toggleAudio = () => {
        if (!localStream.current) return;
        const track = localStream.current.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsAudio(track.enabled);
        }
    };

    const toggleVideo = () => {
        if (!localStream.current) return;
        const track = localStream.current.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideo(track.enabled);
        }
    };

    const replaceVideoTrackInPeers = (newTrack: MediaStreamTrack) => {
        Object.values(peerConnections.current).forEach(pc => {
            const senders = pc.getSenders().filter(s => s.track?.kind === 'video');
            senders.forEach(sender => sender.replaceTrack(newTrack));
        });
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                // 1. Start screen sharing
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = stream.getVideoTracks()[0];

                // 2. When user stops screen sharing via browser UI or toolbar
                screenTrack.onended = () => {
                    // Stop screen sharing state
                    setIsScreenSharing(false);

                    // Restore camera track in peers and local video element
                    const cameraTrack = localStream.current?.getVideoTracks()[0];
                    if (!cameraTrack) return;

                    replaceVideoTrackInPeers(cameraTrack);

                    // Update local video element to camera stream + audio tracks
                    setLocalStreamState(new MediaStream([
                        ...localStream.current!.getAudioTracks(),
                        cameraTrack,
                    ]));

                    localRef.current!.srcObject = localStream.current!;

                    // Stop screen share tracks just in case (cleanup)
                    stream.getTracks().forEach(t => t.stop());
                    screenStream.current = null;
                };

                // 3. Save the screen share stream reference
                screenStream.current = stream;

                // 4. Replace camera track with screen track in peers
                replaceVideoTrackInPeers(screenTrack);

                // 5. Update local video element to show screen share + audio
                setLocalStreamState(new MediaStream([
                    ...localStream.current!.getAudioTracks(),
                    screenTrack,
                ]));

                localRef.current!.srcObject = stream;

                // 6. Update state
                setIsScreenSharing(true);

            } catch (err) {
                console.error('Screen sharing failed:', err);
            }
        } else {
            // If screen sharing is currently ON, stop it and revert to camera

            // Stop all screen tracks & clear reference
            screenStream.current?.getTracks().forEach(track => track.stop());
            screenStream.current = null;

            // Get camera video track
            const cameraTrack = localStream.current?.getVideoTracks()[0];
            if (!cameraTrack) return;

            // Replace screen share track with camera track in all peers
            replaceVideoTrackInPeers(cameraTrack);

            // Update local video element to camera + audio tracks
            setLocalStreamState(new MediaStream([
                ...localStream.current!.getAudioTracks(),
                cameraTrack,
            ]));

            localRef.current!.srcObject = localStream.current!;

            setIsScreenSharing(false);
        }
    };

    const handleCallEnd = async () => {
        if (roomId) {
            const resData = await apiLeaveVideoCall(roomId);
            if (resData.success) {
                dispatch(endMeeting(new Date().toISOString()));
                socketRef.current?.emit(SocketTriggerTypes.LEAVE_ROOM, { roomId, userId });
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.replace('/');
                }
            }
        }
    }

    return {
        isLoading,
        videoStatus,
        localVideoRef,
        remoteStreams,
        isAudio,
        isVideo,
        selectedCardVideo,
        isScreenSharing,
        mediaPermissionError,
        toggleAudio,
        toggleVideo,
        setSelectedCardVideo,
        toggleScreenShare,
        handleCallEnd,
    };
};
