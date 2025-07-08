// components/ChatModal/useChat.ts
'use client';

import { useAppSelector } from '@/lib/hooks';
import { apiUpdateVideoCall } from '@/utils/client/api/api-video-meeting-call';
import { VCallUpdateApiType } from '@/utils/constants';
import { useCallback, useMemo } from 'react';

export function useChat(roomId: string) {
  const currentUser = useAppSelector(s => s.userStore.user)!;
  const messages = useAppSelector(s => s.videoMeeting.chatMessages);
  const allParticipants = useAppSelector(
    state => state.videoMeeting.participants
  )

  // Only recompute the filtered list when the upstream array changes
  const participants = useMemo(
    () => allParticipants.filter(p => p.isActive),
    [allParticipants]
  )
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const objectBody = {
      type: VCallUpdateApiType.NEW_VIDEO_CHAT_MESSAGE,
      meetingId: roomId,
      data: { message: trimmed }
    }
    await apiUpdateVideoCall(objectBody);
  }, [roomId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const objectBody = {
      type: VCallUpdateApiType.REMOVE_VIDEO_CHAT_MESSAGE,
      meetingId: roomId,
      data: { messageId }
    }
    await apiUpdateVideoCall(objectBody);
  }
    , [roomId]);

  return { messages, participants, currentUser, sendMessage, deleteMessage };
};