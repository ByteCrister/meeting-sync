import React, { useEffect, useRef, useState } from 'react';
import { VideoCallService } from '../../services/VideoCallService';
import { VideoGrid } from './VideoGrid';
import { Controls } from './Controls';
import { ParticipantsPanel } from './ParticipantsPanel';
import { SettingsPanel } from './SettingsPanel';
import { ChatPanel } from './ChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    addMessage,
    addParticipant,
    removeParticipant,
    resetVideoCallState,
    setConnectionQuality,
    setMuted,
    setScreenSharing,
    setVideoOn,
    updateStream
} from '@/lib/features/video-call-slice/videoCallSlice';
import { joinVideoCall, leaveVideoCall, updateVideoCall } from '@/utils/client/api/api-video-meeting-call';

interface VideoCallInterfaceProps {
    meetingId: string;
    onEndCall: () => void;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
    meetingId,
    onEndCall
}) => {
    const userId = useAppSelector(state => state.userStore.user?._id) || '';
    const dispatch = useAppDispatch();

    const {
        participants,
        isMuted,
        isVideoOn,
        isScreenSharing,
        connectionQuality,
        messages,
    } = useAppSelector((state) => state.videoCallStore);

    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);

    const videoCallService = useRef<VideoCallService | null>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initializeCall = async () => {
            try {
                setIsInitializing(true);
                await joinVideoCall(meetingId);
                videoCallService.current = new VideoCallService(meetingId, userId);

                // Set up event listeners
                videoCallService.current.onParticipantJoined = (participant) => {
                    dispatch(addParticipant(participant));
                };

                videoCallService.current.onParticipantLeft = (participantId) => {
                    dispatch(removeParticipant(participantId));
                };

                videoCallService.current.onStreamReceived = (participantId, stream) => {
                    dispatch(updateStream({ userId: participantId, stream }));
                };

                videoCallService.current.onConnectionQualityChanged = (participantId, quality) => {
                    dispatch(setConnectionQuality({ userId: participantId, quality }));
                };

                videoCallService.current.onMessageReceived = (participantId, message) => {
                    dispatch(addMessage({
                        userId: participantId,
                        message,
                        timestamp: new Date(),
                    }));
                };

                videoCallService.current.onError = (error) => {
                    setError(error.message);
                };

                // Initialize local stream
                await videoCallService.current.initializeLocalStream(true, true);

                // Start the call
                await videoCallService.current.startCall();

                // Set initial state for local stream
                dispatch(setMuted(false));
                dispatch(setVideoOn(true));
                dispatch(setScreenSharing(false));
                setIsInitializing(false);
            } catch (error) {
                console.error('Error initializing video call:', error);
                setError('Failed to initialize video call. Please try again.');
                setTimeout(() => {
                    onEndCall();
                }, 3000);
            }
        };

        initializeCall();

        return () => {
            if (videoCallService.current) {
                videoCallService.current.cleanup();
            }
            dispatch(resetVideoCallState());
        };
    }, [meetingId, userId, onEndCall, dispatch]);

    const handleMouseMove = () => {
        setIsControlsVisible(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000);
    };

    const handleToggleMute = async () => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.toggleAudio(!isMuted);
                dispatch(setMuted(!isMuted));
                await updateVideoCall({ meetingId, isMuted: !isMuted });
            } catch {
                setError('Failed to toggle audio. Please try again.');
            }
        }
    };

    const handleToggleVideo = async () => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.toggleVideo(!isVideoOn);
                dispatch(setVideoOn(!isVideoOn));
                await updateVideoCall({ meetingId, isVideoOn: !isVideoOn });
            } catch {
                setError('Failed to toggle video. Please try again.');
            }
        }
    };

    const handleToggleScreenShare = async () => {
        if (videoCallService.current) {
            try {
                if (!isScreenSharing) {
                    await videoCallService.current.startScreenShare();
                } else {
                    await videoCallService.current.stopScreenShare();
                }
                dispatch(setScreenSharing(!isScreenSharing));
                await updateVideoCall({ meetingId, isScreenSharing: !isScreenSharing });
            } catch {
                setError('Failed to toggle screen sharing. Please try again.');
            }
        }
    };

    const handleSendMessage = async (message: string) => {
        if (videoCallService.current) {
            try {
                videoCallService.current.sendMessage(message);
                dispatch(addMessage({
                    userId,
                    message,
                    timestamp: new Date(),
                }));
                await updateVideoCall({ meetingId, message });
            } catch {
                setError('Failed to send message. Please try again.');
            }
        }
    };

    const handleEndCall = async () => {
        if (videoCallService.current) {
            await leaveVideoCall(meetingId);
            videoCallService.current.cleanup();
        }
        onEndCall();
    };

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-xl">Initializing video call...</div>
            </div>
        );
    }

    return (
        <div
            className="relative h-screen bg-gray-900"
            onMouseMove={handleMouseMove}
        >
            <VideoGrid
                participants={Array.from(participants.values())}
                userId={userId}
                connectionQuality={connectionQuality}
                onStreamReceived={(userId, stream) => {
                    dispatch(updateStream({ userId, stream }));
                }}
            />

            <AnimatePresence>
                {isControlsVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                    >
                        <Controls
                            isMuted={isMuted}
                            isVideoOn={isVideoOn}
                            isScreenSharing={isScreenSharing}
                            onToggleMute={handleToggleMute}
                            onToggleVideo={handleToggleVideo}
                            onToggleScreenShare={handleToggleScreenShare}
                            onEndCall={handleEndCall}
                            onToggleParticipants={() => setIsParticipantsPanelOpen(!isParticipantsPanelOpen)}
                            onToggleSettings={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                            onToggleChat={() => setIsChatPanelOpen(!isChatPanelOpen)} onToggleFullscreen={function (): void {
                                throw new Error('Function not implemented.');
                            } }                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isParticipantsPanelOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-0 right-0 h-full w-80 bg-gray-800"
                    >
                        <ParticipantsPanel
                            participants={Array.from(participants.values())}
                            onClose={() => setIsParticipantsPanelOpen(false)}
                            isOpen={isParticipantsPanelOpen}
                            userId={userId}
                            connectionQuality={connectionQuality}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSettingsPanelOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-0 right-0 h-full w-80 bg-gray-800"
                    >
                        <SettingsPanel
                            onClose={() => setIsSettingsPanelOpen(false)} isOpen={false} onVideoQualityChange={function (): void {
                                throw new Error('Function not implemented.');
                            } } onAudioDeviceChange={function (): void {
                                throw new Error('Function not implemented.');
                            } } onVideoDeviceChange={function (): void {
                                throw new Error('Function not implemented.');
                            } }                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatPanelOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-0 right-0 h-full w-80 bg-gray-800"
                    >
                        <ChatPanel
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onClose={() => setIsChatPanelOpen(false)} isOpen={false} userId={''}                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
