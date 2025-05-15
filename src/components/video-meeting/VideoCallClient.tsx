"use client";

import { useAppSelector } from "@/lib/hooks";
import { VMSocketTriggerTypes } from "@/utils/constants";
import { getSocket } from "@/utils/socket/initiateSocket";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VideoCallClient() {
    const searchParams = useSearchParams();
    const roomId = searchParams?.get("roomId");
    const userId = useAppSelector((state) => state.userStore.user?._id);

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!roomId || !userId) return;

        const socket = getSocket();
        socketRef.current = socket;

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, // STUN server
            ],
        });
        peerRef.current = peer;

        socket.emit(VMSocketTriggerTypes.JOIN_ROOM, { roomId, userId });

        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideo.current) localVideo.current.srcObject = stream;

            stream.getTracks().forEach((track) => peer.addTrack(track, stream));

            peer.ontrack = (e) => {
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = e.streams[0];
                }
            };

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit(VMSocketTriggerTypes.ICE_CANDIDATE, {
                        roomId,
                        candidate: e.candidate,
                    });
                }
            };
        };

        init();

        // Signaling events
        socket.on(VMSocketTriggerTypes.USER_JOINED, async () => {
            if (!peerRef.current) return;
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            socket.emit(VMSocketTriggerTypes.OFFER, { roomId, offer });
        });

        socket.on(VMSocketTriggerTypes.RECEIVE_OFFER, async ({ offer }) => {
            if (!peerRef.current) return;
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socket.emit(VMSocketTriggerTypes.ANSWER, { roomId, answer });
        });

        socket.on(VMSocketTriggerTypes.RECEIVE_ANSWER, async ({ answer }) => {
            if (!peerRef.current) return;
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on(VMSocketTriggerTypes.RECEIVE_ICE_CANDIDATE, async ({ candidate }) => {
            if (!peerRef.current) return;
            try {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ICE candidate", err);
            }
        });

        return () => {
            socket.disconnect();
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [roomId, userId]);

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <video ref={localVideo} autoPlay muted className="rounded-xl border" />
            <video ref={remoteVideo} autoPlay className="rounded-xl border" />
        </div>
    );
}
