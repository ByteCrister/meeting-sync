"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    Share, 
    MessageSquare, 
    PhoneOff, 
    Settings
} from "lucide-react";
import { VideoControlsProps } from "./types";

export function VideoControls({
    isMuted,
    isVideoOn,
    isScreenSharing,
    showChat,
    showSettings,
    onToggleMute,
    onToggleVideo,
    onToggleScreenShare,
    onToggleChat,
    onToggleSettings,
    onEndCall
}: VideoControlsProps) {
    return (
        <div className="p-4 border-t border-gray-800">
            <div className="flex justify-center items-center space-x-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMute}
                    className={cn(
                        "rounded-full",
                        isMuted && "bg-red-500 hover:bg-red-600"
                    )}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleVideo}
                    className={cn(
                        "rounded-full",
                        !isVideoOn && "bg-red-500 hover:bg-red-600"
                    )}
                >
                    {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleScreenShare}
                    className={cn(
                        "rounded-full",
                        isScreenSharing && "bg-blue-500 hover:bg-blue-600"
                    )}
                >
                    <Share className="h-6 w-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleChat}
                    className={cn(
                        "rounded-full",
                        showChat && "bg-blue-500 hover:bg-blue-600"
                    )}
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSettings}
                    className={cn(
                        "rounded-full",
                        showSettings && "bg-blue-500 hover:bg-blue-600"
                    )}
                >
                    <Settings className="h-6 w-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEndCall}
                    className="rounded-full bg-red-500 hover:bg-red-600"
                >
                    <PhoneOff className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
} 