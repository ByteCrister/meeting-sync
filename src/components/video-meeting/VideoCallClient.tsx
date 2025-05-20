"use client";

import { useAppSelector } from "@/lib/hooks";
import { getVideoCallStatus, joinVideoCall } from "@/utils/client/api/api-video-meeting-call";
import { IVideoCallStatus, VideoCallErrorTypes, VMSocketTriggerTypes } from "@/utils/constants";
import { getSocket } from "@/utils/socket/initiateSocket";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MeetingNotStarted from "../errors/MeetingNotStarted";
import FullPageError from "../errors/FullPageError";
import useVideoSocket from "@/hooks/useVideoSocket";
import { setMeetingDetails, VideoCallStatus } from "@/lib/features/videoMeeting/videoMeetingSlice";

export default function VideoCallClient() {
    const searchParams = useSearchParams();
    const roomId = searchParams?.get("roomId");
    const userId = useAppSelector((state) => state.userStore.user?._id);

    const localVideo = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
    const remoteStreamsRef = useRef<{ [userId: string]: MediaStream }>({});
    const [remoteUsers, setRemoteUsers] = useState<{ [userId: string]: MediaStream }>({});
    const [videoCallStatus, setVideoCallStatus] = useState<VideoCallErrorTypes | null>(null);
    const JoinStatus = useAppSelector((state) => state.videoCallStore.status);
    useVideoSocket(roomId || "");

    useEffect(() => {
        if (!roomId || !userId) return;

        const startVideoCall = async () => {
            const videoCallStatusData = await getVideoCallStatus(roomId);

            if (videoCallStatusData.isError) {
                setVideoCallStatus(videoCallStatusData.errorType);
                return;
            }

            const joinStatusData = await joinVideoCall(roomId);
            if (joinStatusData.success && joinStatusData?.meetingStatus === IVideoCallStatus.WAITING) {
                return;
            } else if (joinStatusData.success && joinStatusData?.meeting) {
                setMeetingDetails(joinStatusData.meeting);
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

            const createPeerConnection = (targetUserId: string) => {
                const peer = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
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

            // Someone else joined
            socket.on(VMSocketTriggerTypes.USER_JOINED, async ({ newUserId }) => {
                if (newUserId === userId) return;
                const peer = createPeerConnection(newUserId);
                peersRef.current[newUserId] = peer;

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);

                socket.emit(VMSocketTriggerTypes.OFFER, { roomId, newUserId, offer });
            });

            // Someone sent us an offer
            socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ fromUserId, offer }) => {
                const peer = createPeerConnection(fromUserId);
                peersRef.current[fromUserId] = peer;

                await peer.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit(VMSocketTriggerTypes.ANSWER, { roomId, fromUserId, answer });
            });

            // Someone responded with an answer
            socket.on(VMSocketTriggerTypes.RECEIVE_ANSWER, async ({ fromUserId, answer }) => {
                const peer = peersRef.current[fromUserId];
                await peer?.setRemoteDescription(new RTCSessionDescription(answer));
            });

            // Someone sent ICE
            socket.on(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, async ({ fromUserId, candidate }) => {
                const peer = peersRef.current[fromUserId];
                await peer?.addIceCandidate(new RTCIceCandidate(candidate));
            });
        };

        startVideoCall();

        return () => {
            socketRef.current?.disconnect();
            localStreamRef.current?.getTracks().forEach((t) => t.stop());

            Object.values(peersRef.current).forEach((peer) => peer.close());
            peersRef.current = {};
            remoteStreamsRef.current = {};
        };
    }, [roomId, userId, JoinStatus]);

    if (videoCallStatus === VideoCallErrorTypes.USER_NOT_FOUND) return <FullPageError message="User not found. Please try to signin again." />
    if (videoCallStatus === VideoCallErrorTypes.MEETING_NOT_FOUND) return <FullPageError message="Meeting is not valid. Meeting maybe removed or Room ID is incorrect." />
    if (videoCallStatus === VideoCallErrorTypes.MEETING_ENDED) return <FullPageError message="The meeting is ended." />
    if (videoCallStatus === VideoCallErrorTypes.USER_NOT_PARTICIPANT) return <FullPageError message="You did not booked this meeting." />
    if (videoCallStatus === VideoCallErrorTypes.USER_ALREADY_JOINED) return <FullPageError message="You are already joined in this meeting." />
    if (JoinStatus === VideoCallStatus.WAITING) return <MeetingNotStarted />

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <video ref={localVideo} autoPlay muted className="rounded-xl border" />
            {Object.entries(remoteUsers).map(([id, stream]) => (
                <video
                    key={id}
                    autoPlay
                    playsInline
                    className="rounded-xl border"
                    ref={(videoEl) => {
                        if (videoEl && stream) {
                            videoEl.srcObject = stream;
                        }
                    }}
                />
            ))}
        </div>
    );
};
