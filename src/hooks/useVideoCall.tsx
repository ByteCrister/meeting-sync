'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SocketTriggerTypes, VideoCallErrorTypes, VMSocketTriggerTypes } from '@/utils/constants';
import { getSocket } from '@/utils/socket/initiateSocket';
import { getClonedMediaStream, stopBaseStream } from '@/utils/media/mediaStreamManager';
import { useAppDispatch } from '@/lib/hooks';
import { apiLeaveVideoCall } from '@/utils/client/api/api-video-meeting-call';
import { addChatMessage, addParticipant, endMeeting, removeChatMessage, removeParticipant, setVideoCallStatus, updateSettings, VideoCallStatus } from '@/lib/features/videoMeeting/videoMeetingSlice';
import ShadcnToast from '@/components/global-ui/toastify-toaster/ShadcnToast';

const createPeerConnection = async () => {
    try {
        const response = await fetch("/api/ice"); // calls your server route
        const { v } = await response.json() as { v: { iceServers: RTCIceServer[] } };

        const pc = new RTCPeerConnection({
            iceServers: v.iceServers, // now using Xirsys STUN/TURN
        });

        // continue with your peer connection setup...
        return pc;
    } catch (error) {
        console.error("Failed to get ICE servers:", error);
        // fallback to public STUN (not recommended for prod)
        return new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
    }
};

type PeerMap = Record<string, RTCPeerConnection>;
type CandQueue = Record<string, RTCIceCandidateInit[]>;
type RemoteStreamMap = Record<string, MediaStream>;

export const useVideoCall = (roomId: string, userId: string) => {
    const dispatch = useAppDispatch();
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
    const localRef = useRef<HTMLVideoElement | null>(null);
    const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnections = useRef<PeerMap>({});
    const pendingCandidates = useRef<CandQueue>({});
    const pendingAnswers = useRef<Record<string, RTCSessionDescriptionInit>>({});
    const [remoteStreams, setRemoteStreams] = useState<RemoteStreamMap>({});
    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStream = useRef<MediaStream | null>(null);
    const [selectedCardVideo, setSelectedCardVideo] = useState<null | MediaStream>(null);
    const negotiationInProgress = useRef<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [videoStatus, setVideoStatus] = useState<VideoCallErrorTypes | null>(null); // For video call status (error or success)
    const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
    const [unseenMessages, setUnseenMessages] = useState<number>(0);
    // Polling cleanup refs for negotiation rollback
    const negotiationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const negotiationIntervals = useRef<Record<string, NodeJS.Timeout>>({});
    // Helper to clear rollback poll timers
    const clearRollbackTimers = (id: string) => {
        if (negotiationTimeouts.current[id]) {
            clearTimeout(negotiationTimeouts.current[id]);
            delete negotiationTimeouts.current[id];
        }
        if (negotiationIntervals.current[id]) {
            clearTimeout(negotiationIntervals.current[id]);
            delete negotiationIntervals.current[id];
        }
    };
    // callback ref that always sets srcObject for us:
    const localVideoRef = useCallback(
        (el: HTMLVideoElement | null) => {
            localRef.current = el;
            if (el && localStream.current) {
                el.srcObject = localStream.current;
            }
        },
        []
    )

    // Instead of reload on camera permission granted, dynamically re-acquire stream
    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
                result.onchange = async () => {
                    if (result.state === 'granted') {
                        ShadcnToast('Camera permission granted, reinitializing media...');
                        try {
                            const stream = await getClonedMediaStream();
                            localStream.current = stream;
                            setLocalStreamState(stream);

                            // Replace tracks in peers dynamically
                            const videoTrack = stream.getVideoTracks()[0];
                            const audioTrack = stream.getAudioTracks()[0];
                            if (videoTrack) {
                                Object.values(peerConnections.current).forEach((pc) => {
                                    const senders = pc.getSenders().filter((s) => s.track?.kind === 'video');
                                    senders.forEach((sender) => sender.replaceTrack(videoTrack));
                                });
                            }
                            if (audioTrack) {
                                Object.values(peerConnections.current).forEach((pc) => {
                                    const senders = pc.getSenders().filter((s) => s.track?.kind === 'audio');
                                    senders.forEach((sender) => sender.replaceTrack(audioTrack));
                                });
                            }
                        } catch (err) {
                            ShadcnToast('Failed to reinitialize media after permission change.');
                            console.log('Error reinitializing media:', err);
                        }
                    }
                };
            } catch (err) {
                console.log('Permission API not supported', err);
            }
        };
        checkCameraPermission();
    }, []);
    const setupPeerConnection = async (otherId: string) => {
        // Always clean old connection first (even if missed before)
        if (peerConnections.current[otherId]) {
            console.log(`[PC CLEANUP] Closing stale peer for ${otherId}`);
            peerConnections.current[otherId].close();
            delete peerConnections.current[otherId];
        }

        const pc = await createPeerConnection();
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                pc.addTrack(audioTrack, localStream.current);
            }
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                pc.addTrack(videoTrack, localStream.current);
            }
        } else {
            console.warn("Local stream missing, skipping track addition");
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
            if (userId < otherId) {
                console.log(`[NEGOTIATION] Skipping offer creation to avoid double-offer conflict. userId: ${userId}, otherId: ${otherId}`);
                return;
            }
            negotiationInProgress.current[otherId] = true;

            try {
                console.log(`[NEGOTIATION] Starting negotiation for ${otherId}, signalingState: ${pc.signalingState}`);

                // If signalingState is not stable, rollback first
                if (pc.signalingState !== 'stable') {
                    console.log(`[NEGOTIATION] signalingState is ${pc.signalingState}, performing rollback`);
                    await pc.setLocalDescription({ type: 'rollback' });

                    // Wait for signalingState to return to stable
                    await new Promise<void>((resolve, reject) => {
                        negotiationTimeouts.current[otherId] = setTimeout(() => {
                            clearRollbackTimers(otherId);
                            reject(new Error('Rollback timed out'));
                        }, 5000);

                        const checkState = () => {
                            if (pc.signalingState === 'stable') {
                                clearRollbackTimers(otherId);
                                resolve();
                            } else {
                                negotiationIntervals.current[otherId] = setTimeout(checkState, 100);
                            }
                        };
                        checkState();
                    });

                    console.log(`[NEGOTIATION] Rollback complete, signalingState now: ${pc.signalingState}`);
                }

                // Only create and send offer if stable
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

                    // 💡 Try applying any previously queued answer
                    const queuedAnswer = pendingAnswers.current?.[otherId];
                    if (queuedAnswer && !pc.remoteDescription) {
                        try {
                            await pc.setRemoteDescription(new RTCSessionDescription(queuedAnswer));
                            console.log(`[NEGOTIATION] ✅ Applied previously queued answer from ${otherId}`);
                            delete pendingAnswers.current[otherId];

                            const candidates = pendingCandidates.current?.[otherId] || [];
                            for (const candidate of candidates) {
                                try {
                                    await pc.addIceCandidate(candidate);
                                } catch (err) {
                                    console.warn(`[ICE] ❌ Failed to apply candidate after answer for ${otherId}`, err);
                                }
                            }
                            delete pendingCandidates.current[otherId];
                        } catch (err) {
                            console.error(`[NEGOTIATION] ❌ Failed to apply queued answer from ${otherId}`, err);
                        }
                    }
                } else {
                    console.log(`[NEGOTIATION] signalingState not stable after rollback, skipping offer`);
                }
            } catch (err) {
                console.error(`[NEGOTIATION ERROR] for ${otherId}:`, err);
            } finally {
                negotiationInProgress.current[otherId] = false;
                clearRollbackTimers(otherId);
            }
        };

        peerConnections.current[otherId] = pc;
        return pc;
    };
    useEffect(() => {

        const joinRoom = async () => {
            try {

                if (!localRef.current) {
                    console.log("Local video element not set yet.");
                }

                // Get media stream (does not block join)
                try {
                    const clonedStream = await getClonedMediaStream();
                    localStream.current = clonedStream;
                    if (clonedStream.getTracks().length > 0) {
                        setLocalStreamState(clonedStream);
                    } else {
                        ShadcnToast('Joined call without any media tracks.');
                        console.log('Joined without any media stream');
                    }
                } catch (err) {
                    ShadcnToast('Media permission error or denied.');
                    console.log('Media permission error:', err);
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

                socket.removeAllListeners();

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
                        console.log(`[REJOIN DETECTED] Cleaning up stale peer connection for ${newUserId}`);
                        peerConnections.current[newUserId].close();
                        delete peerConnections.current[newUserId];
                    }
                    delete pendingAnswers.current[newUserId];
                    delete pendingCandidates.current[newUserId];
                    delete negotiationInProgress.current[newUserId];
                    // ✅ Prevent stale timers from triggering
                    clearRollbackTimers(newUserId);

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
                    if (!pc) {
                        console.warn(`[RECEIVE_ANSWER] PeerConnection not found for ${fromUserId}`);
                        return;
                    }

                    try {
                        const canApplyAnswer =
                            pc.signalingState === 'have-local-offer' &&
                            pc.localDescription?.type === 'offer' &&
                            !pc.remoteDescription;


                        if (canApplyAnswer) {
                            await pc.setRemoteDescription(new RTCSessionDescription(answer));
                            console.log(`[RECEIVE_ANSWER] ✅ Applied remote answer from ${fromUserId}`);

                            const queued = pendingCandidates.current[fromUserId] || [];
                            for (const candidate of queued) {
                                try {
                                    await pc.addIceCandidate(candidate);
                                } catch (err) {
                                    console.warn(`[ICE] Failed to apply candidate for ${fromUserId}`, err);
                                }
                            }
                            delete pendingCandidates.current[fromUserId];
                            delete pendingAnswers.current[fromUserId];
                        } else {
                            console.warn(
                                `[RECEIVE_ANSWER] ❌ Queuing answer. Invalid signalingState='${pc.signalingState}' for ${fromUserId}`
                            );
                            pendingAnswers.current[fromUserId] = answer;
                        }
                    } catch (err) {
                        console.error(`[RECEIVE_ANSWER] ❌ Failed to apply answer from ${fromUserId}:`, err);
                    }
                });

                socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ fromUserId, offer }) => {
                    let pc = peerConnections.current[fromUserId];
                    if (!pc) {
                        pc = await setupPeerConnection(fromUserId);
                    }

                    if (negotiationInProgress.current[fromUserId]) {
                        console.log(`[OFFER] Negotiation already in progress for ${fromUserId}, ignoring incoming offer to avoid flood.`);
                        return;
                    }

                    negotiationInProgress.current[fromUserId] = true;

                    try {
                        const offerDesc = new RTCSessionDescription(offer);

                        if (pc.signalingState === "have-local-offer") {
                            console.log(`[OFFER] signalingState have-local-offer, rolling back`);
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
                            console.log(`[OFFER] signalingState not stable: ${pc.signalingState}. Ignoring offer.`);
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
                            console.log(`[${fromUserId}] Not in 'have-remote-offer' state, skipping answer`);
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
                            await pc.addIceCandidate(init).catch(console.log);
                        } else {
                            pendingCandidates.current[fromUserId] ||= [];
                            pendingCandidates.current[fromUserId].push(init);
                        }
                    }
                );

                socket.emit(VMSocketTriggerTypes.JOIN_ROOM, { roomId, userId }, (result: { success: boolean; hostPresent: boolean }) => {
                    console.log('[JOIN ROOM RESULT]', result);
                    if (result?.hostPresent) {
                        dispatch(setVideoCallStatus(VideoCallStatus.ACTIVE));
                    } else {
                        dispatch(setVideoCallStatus(VideoCallStatus.WAITING));
                    }
                });

                socket.on(VMSocketTriggerTypes.USER_LEAVED, ({ userId: leaver }) => {
                    const pc = peerConnections.current[leaver];
                    if (pc) {
                        pc.close();
                        delete peerConnections.current[leaver];
                    }
                    delete pendingAnswers.current[leaver];
                    delete pendingCandidates.current[leaver];
                    delete negotiationInProgress.current[leaver];

                    setRemoteStreams((prev) => {
                        const next = { ...prev };
                        delete next[leaver];
                        return next;
                    });
                });

                // ! ----------- Mange States in Redux ---------------

                // Event: New participant joined
                socket.on(SocketTriggerTypes.NEW_PARTICIPANT_JOINED, (data) => {
                    dispatch(addParticipant(data));
                });

                // Event: New chat message
                socket.on(SocketTriggerTypes.NEW_METING_CHAT_MESSAGE, (data) => {
                    if (!isChatModalOpen) {
                        setUnseenMessages(prev => prev + 1);
                    }
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


    const toggleAudio = async () => {
        if (!localStream.current) return;

        try {
            if (!isAudio) {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioTrack = audioStream.getAudioTracks()[0];
                if (audioTrack) {
                    localStream.current.addTrack(audioTrack);
                    Object.values(peerConnections.current).forEach((pc) => pc.addTrack(audioTrack, localStream.current!));
                    setIsAudio(true);
                }
            } else {
                const audioTrack = localStream.current.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.stop();
                    localStream.current.removeTrack(audioTrack);
                    Object.values(peerConnections.current).forEach((pc) => {
                        const sender = pc.getSenders().find((s) => s.track === audioTrack);
                        if (sender) pc.removeTrack(sender);
                    });
                    setIsAudio(false);
                }
            }
        } catch (err) {
            ShadcnToast('Audio permission denied or error toggling audio.');
            console.log('Audio toggle error:', err);
        }
    };

    const toggleVideo = () => {
        const stream = localStream.current;
        if (!stream) return;

        const [videoTrack] = stream.getVideoTracks();
        if (!videoTrack) return;

        // Mute/unmute without renegotiation
        const nowEnabled = !videoTrack.enabled;
        videoTrack.enabled = nowEnabled;
        setIsVideo(nowEnabled);

        // Refresh local view
        if (localRef.current) {
            localRef.current.srcObject = stream;
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
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = stream.getVideoTracks()[0];

                screenTrack.onended = () => {
                    setIsScreenSharing(false);

                    const cameraTrack = localStream.current?.getVideoTracks()[0];
                    if (!cameraTrack) return;

                    replaceVideoTrackInPeers(cameraTrack);
                    setLocalStreamState(new MediaStream([
                        ...localStream.current!.getAudioTracks(),
                        cameraTrack,
                    ]));

                    if (localRef.current) {
                        localRef.current.srcObject = new MediaStream([
                            ...localStream.current!.getAudioTracks(),
                            cameraTrack,
                        ]);
                    }

                    stream.getTracks().forEach(t => t.stop());
                    screenStream.current = null;
                };

                screenStream.current = stream;
                replaceVideoTrackInPeers(screenTrack);
                setLocalStreamState(new MediaStream([
                    ...localStream.current!.getAudioTracks(),
                    screenTrack,
                ]));

                if (localRef.current) {
                    localRef.current.srcObject = new MediaStream([
                        ...localStream.current!.getAudioTracks(),
                        screenTrack,
                    ]);
                }

                setIsScreenSharing(true);

            } catch (err) {
                console.error('Screen sharing failed:', err);
            }
        }
        else {
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

            if (localRef.current && localStream.current) {
                localRef.current.srcObject = localStream.current;
            }

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

    const clearUnSeenMessages = () => {
        setUnseenMessages(0);
    };

    return {
        isLoading,
        videoStatus,
        localVideoRef,
        remoteStreams,
        isAudio,
        isVideo,
        selectedCardVideo,
        isScreenSharing,
        unseenMessages,
        // mediaPermissionError,
        toggleAudio,
        toggleVideo,
        setSelectedCardVideo,
        toggleScreenShare,
        handleCallEnd,
        setIsChatModalOpen,
        clearUnSeenMessages
    };
};
