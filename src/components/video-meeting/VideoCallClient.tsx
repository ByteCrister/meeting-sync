"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { apiUpdateVideoCall, apiLeaveVideoCall } from "@/utils/client/api/api-video-meeting-call";
import { VideoCallErrorTypes, SocketTriggerTypes, VCallUpdateApiType } from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingNotStarted from "../errors/MeetingNotStarted";
import FullPageError from "../errors/FullPageError";
import useVideoSocket from "@/hooks/useVideoSocket";
import {
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
import LoadingUi from "../global-ui/ui-component/LoadingUi";

// Define a mapping from video call error types to their messages.
const errorMessages = {
    [VideoCallErrorTypes.USER_NOT_FOUND]: "User not found. Please try to signin again.",
    [VideoCallErrorTypes.MEETING_NOT_FOUND]: "Meeting is not valid. Meeting may have been removed or the Room ID is incorrect.",
    [VideoCallErrorTypes.MEETING_ENDED]: "The meeting has ended.",
    [VideoCallErrorTypes.USER_NOT_PARTICIPANT]: "You did not book this meeting.",
    [VideoCallErrorTypes.USER_ALREADY_JOINED]: "You have already joined this meeting.",
};


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

    const router = useRouter();

    const {
        isLoading,
        socketRef,
        videoCallStatus,
        networkQuality,
        localVideo,
        localStreamRef,
        remoteUsers,
        peersRef,
        screenShareStreamRef,
        startVideoCall
    } = useVideoSocket(roomId || "");

    useEffect(() => {
        startVideoCall();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            <LoadingUi />
        );
    }


    // Check if the current videoCallStatus has a corresponding error message.
    if (videoCallStatus && Object.prototype.hasOwnProperty.call(errorMessages, videoCallStatus)) {
        return <FullPageError message={errorMessages[videoCallStatus as keyof typeof errorMessages]} />;
    }

    // Handle other states like a waiting meeting.
    if (meetingState.status === VideoCallStatus.WAITING) {
        return <MeetingNotStarted />;
    }

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
