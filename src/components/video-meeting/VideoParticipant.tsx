"use client";

import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoParticipantProps } from "./types";

export function VideoParticipant({ stream, participant, isLocal = false }: VideoParticipantProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative rounded-xl overflow-hidden bg-gray-800">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={participant.image} />
                    <AvatarFallback>{participant.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{isLocal ? 'You' : participant.username}</span>
            </div>
        </div>
    );
} 