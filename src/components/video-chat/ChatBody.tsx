'use client';

import { useState } from 'react';
import { ChatMessageItem } from './ChatMessageItem';
import { ParticipantsList } from './ParticipantsList';
import { ChatMessage, VideoCallParticipant } from '@/lib/features/videoMeeting/videoMeetingSlice';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useAppSelector } from '@/lib/hooks';

interface Props {
    view: 'chat' | 'participants';
    messages: ChatMessage[];
    participants: VideoCallParticipant[];
    deleteMessage: (messageId: string) => void;
}

export function ChatBody({ view, messages, participants, deleteMessage }: Props) {
    const currentUserId = useAppSelector(state => state.userStore.user?._id);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    if (view === 'participants') {
        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h2 className="text-lg font-semibold text-gray-200">Participants</h2>
                <ParticipantsList participants={participants} />
            </div>
        );
    }

    return (
        <div
            className="
        flex-1 overflow-y-auto px-6 py-4 space-y-5
        scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800/30
      "
            style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
            {messages.map(msg => (
                <ChatMessageItem
                    key={msg._id}
                    msg={msg}
                    isOwn={msg.userId === currentUserId}
                    onDelete={(id) => setConfirmId(id)}
                />
            ))}
            {confirmId && (
                <ConfirmDeleteModal
                    onConfirm={() => {
                        deleteMessage(confirmId);
                        setConfirmId(null);
                    }}
                    onCancel={() => setConfirmId(null)}
                />
            )}
        </div>
    );
}
