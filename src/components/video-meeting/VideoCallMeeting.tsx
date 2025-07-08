'use client';

import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import VideoControls from './VideoControls';
import LoadingUi from '../global-ui/ui-component/LoadingUi';
import FullPageError from '../errors/FullPageError';
import MeetingNotStarted from '../errors/MeetingNotStarted';
import { useEffect, useRef } from 'react';
import { videoErrorMessages } from '@/utils/error-messages/messages';
import { VideoCallStatus } from '@/lib/features/videoMeeting/videoMeetingSlice';
import { Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatModal } from '../video-chat/ChatModal';
import { useVideoCall } from '@/hooks/useVideoCall';
import MeetingEndCountdown from './MeetingEndCountdown';

// Component for Spotlighted Guest Video
function SpotlightVideo({ stream }: { stream: MediaStream }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-lg shadow-lg bg-black"
        />
    );
}

// Component for Guest Video Tile
function GuestTile({
    peerId,
    stream,
    selected,
    onClick,
}: {
    peerId: string;
    stream: MediaStream;
    selected: boolean;
    onClick: (stream: MediaStream) => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div
            onClick={() => onClick(stream)}
            className={`relative cursor-pointer rounded-lg overflow-hidden transform transition-all duration-200 ${selected ? 'scale-105 ring-4 ring-blue-400' : 'hover:scale-105'
                }`}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover rounded-md"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-sm">{`User ${peerId.slice(-4)}`}</span>
            </div>
        </div>
    );
}

export default function VideoCallMeeting() {
    const searchParams = useSearchParams();
    const roomId = searchParams?.get('roomId') || '';
    const userId = useAppSelector((s) => s.userStore.user?._id || '');
    const meetingState = useAppSelector((state) => state.videoMeeting);

    const {
        isLoading,
        videoStatus,
        localVideoRef,
        remoteStreams,
        selectedCardVideo,
        isAudio,
        isVideo,
        isScreenSharing,
        toggleAudio,
        toggleVideo,
        setSelectedCardVideo,
        toggleScreenShare,
        handleCallEnd
    } = useVideoCall(roomId, userId);

    const guestIds = Object.keys(remoteStreams);
    const hasGuests = guestIds.length > 0;
    const isAlone = !hasGuests && !selectedCardVideo;

    if (isLoading) return <LoadingUi />;

    if (!roomId) {
        return <FullPageError message="Room ID is missing from the URL." />;
    }

    if (videoStatus) {
        return <FullPageError message={videoErrorMessages[videoStatus]} />;
    }

    if (meetingState.status === VideoCallStatus.WAITING) {
        return <MeetingNotStarted />;
    }

    const onTileClick = (stream: MediaStream) => {
        setSelectedCardVideo((prev) => (prev === stream ? null : stream));
    };

    return (
        <div className="relative flex flex-col h-screen bg-gray-900 text-white">

            {/* Local PIP when guests are present */}
            {hasGuests && (
                <div className="absolute top-4 right-4 w-40 md:w-48 aspect-video rounded-lg overflow-hidden border border-white/20 shadow-lg bg-black/30 backdrop-blur">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Main Video Area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
                <AnimatePresence mode="wait">
                    {selectedCardVideo ? (
                        <motion.div
                            key="spotlight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full flex justify-center items-center"
                        >
                            <SpotlightVideo stream={selectedCardVideo} />
                        </motion.div>
                    ) : isAlone ? (
                        <motion.video
                            key="local-alone"
                            ref={localVideoRef}
                            autoPlay
                            muted={!selectedCardVideo}
                            playsInline
                            className="max-h-[85vh] w-auto rounded-2xl shadow-xl bg-black object-contain transition-all"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4 w-full h-full overflow-auto p-2">
                            {guestIds.map((peerId) => (
                                <GuestTile
                                    key={peerId}
                                    peerId={peerId}
                                    stream={remoteStreams[peerId]!}
                                    selected={selectedCardVideo === remoteStreams[peerId]}
                                    onClick={onTileClick}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Back to Gallery Button */}
            {selectedCardVideo && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 z-40"
                >
                    <button
                        onClick={() => setSelectedCardVideo(null)}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm shadow-lg backdrop-blur-lg transition-all duration-300 ease-in-out"
                    >
                        <Grid className="w-4 h-4" />
                        <span>Gallery View</span>
                    </button>
                </motion.div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <VideoControls
                    isAudio={isAudio}
                    isVideo={isVideo}
                    isScreenSharing={isScreenSharing}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    toggleScreenShare={toggleScreenShare}
                    handleCallEnd={handleCallEnd}
                />
            </div>

            <ChatModal roomId={roomId} />
            <MeetingEndCountdown endTime={meetingState.endTime || ''} />
        </div>
    );
}