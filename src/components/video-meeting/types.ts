import { VideoCallParticipant, ChatMessage, VideoCallSettings } from "@/lib/features/videoMeeting/videoMeetingSlice";

export interface VideoCallErrorBoundaryProps {
    children: React.ReactNode;
}

export interface VideoCallErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export interface VideoControlsProps {
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
    showChat: boolean;
    showSettings: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare: () => void;
    onToggleChat: () => void;
    onToggleSettings: () => void;
    onEndCall: () => void;
}

export interface VideoParticipantProps {
    stream: MediaStream;
    participant: VideoCallParticipant;
    isLocal?: boolean;
}

export interface ChatSidebarProps {
    messages: ChatMessage[];
    participants: VideoCallParticipant[];
    onSendMessage: (message: string) => void;
    onDeleteMessage: (messageId: string) => Promise<void>;
}

export interface SettingsSidebarProps {
    settings: VideoCallSettings;
    onUpdateSettings: (settings: Partial<VideoCallSettings>) => void;
}

export interface NetworkQualityIndicatorProps {
    quality: 'good' | 'poor';
} 