import { CallParticipant } from '@/services/VideoCallService';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff, VideoOff, Wifi, WifiOff } from 'lucide-react';

interface VideoGridProps {
    participants: CallParticipant[];
    userId: string;
    connectionQuality: Record<string, 'good' | 'medium' | 'poor'>;
    onStreamReceived: (userId: string, stream: MediaStream) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
    participants,
    userId,
    connectionQuality,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStreamReceived,
}) => {
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        // Update video elements when participants change
        participants.forEach(participant => {
            const videoElement = videoRefs.current.get(participant.userId);
            if (videoElement && participant.stream) {
                // Ensure the stream is properly attached
                if (videoElement.srcObject !== participant.stream) {
                    videoElement.srcObject = participant.stream;
                    
                    // Handle video play errors
                    videoElement.onerror = (error) => {
                        console.error('Video playback error:', error);
                    };

                    // Ensure video plays
                    videoElement.play().catch(error => {
                        console.error('Error playing video:', error);
                    });
                }
            }
        });

        // Cleanup function
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            videoRefs.current.forEach(videoElement => {
                if (videoElement.srcObject) {
                    videoElement.srcObject = null;
                }
            });
        };
    }, [participants]);

    const getGridClass = () => {
        const count = participants.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 9) return 'grid-cols-3';
        return 'grid-cols-4';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4 p-4 h-full`}>
            <AnimatePresence>
                {participants.map((participant) => (
                    <motion.div
                        key={participant.userId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
                    >
                        <video
                            ref={(el) => {
                                if (el) {
                                    videoRefs.current.set(participant.userId, el);
                                    if (participant.stream) {
                                        el.srcObject = participant.stream;
                                        el.play().catch(error => {
                                            console.error('Error playing video:', error);
                                        });
                                    }
                                }
                            }}
                            autoPlay
                            playsInline
                            muted={participant.userId === userId}
                            className="w-full h-full object-cover"
                            onLoadedMetadata={() => {
                                const video = videoRefs.current.get(participant.userId);
                                if (video) {
                                    video.play().catch(error => {
                                        console.error('Error playing video:', error);
                                    });
                                }
                            }}
                        />

                        {/* Participant Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm">
                                        {participant.userId === userId ? 'You' : `Participant ${participant.userId}`}
                                    </span>
                                    {participant.isMuted && (
                                        <MicOff size={16} className="text-white" />
                                    )}
                                    {!participant.isVideoOn && (
                                        <VideoOff size={16} className="text-white" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {connectionQuality[participant.userId] === 'poor' ? (
                                        <WifiOff size={16} className="text-red-500" />
                                    ) : (
                                        <Wifi size={16} className="text-green-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Video/Audio Off Overlay */}
                        {!participant.isVideoOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <div className="text-white text-2xl">
                                    {participant.userId === userId ? 'You' : `Participant ${participant.userId}`}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
