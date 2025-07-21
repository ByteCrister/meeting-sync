'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { ChatMessage } from '@/lib/features/videoMeeting/videoMeetingSlice';
import { useAppSelector } from '@/lib/hooks';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useSwipeable } from 'react-swipeable';

interface Props {
  msg: ChatMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}

export function ChatMessageItem({ msg, isOwn, onDelete }: Props) {
  const participants = useAppSelector(s => s.videoMeeting.participants);
  const participant = participants.find(p => p.userId === msg.userId);
  const currentUser = useAppSelector(s => s.userStore.user);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isOwn) onDelete(msg._id);
    },
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  return (
    <div
      {...swipeHandlers}
      className={clsx(
        'group flex items-start relative',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwn && (
        <Image
          src={participant?.image || '/default-avatar.png'}
          alt={participant?.username || 'User'}
          width={36}
          height={36}
          className="rounded-full ring-1 ring-gray-500/50"
        />
      )}

      <div
        className={clsx(
          'relative mx-3 p-4 rounded-2xl max-w-[75%] break-words',
          'bg-white/20 text-gray-100 shadow-md transition-colors',
          isOwn ? 'rounded-br-none' : 'rounded-bl-none'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-200">
            {isOwn ? currentUser?.username : participant?.username || 'Unknown (leaved)'}
          </span>
          <span className="text-xs text-gray-100 italic">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.message}
        </p>

        {isOwn && (
          <button
            onClick={() => onDelete(msg._id)}
            className={clsx(
              'absolute -top-2 -right-2 p-1 rounded-full bg-pink-500/80 hover:bg-pink-600 transition',
              'text-white shadow-md',
              'opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100',
              'block md:block'
            )}
            aria-label="Delete message"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOwn && (
        <Image
          src={currentUser?.image || '/default-avatar.png'}
          alt={currentUser?.username || 'You'}
          width={36}
          height={36}
          className="rounded-full ring-1 ring-gray-500/50"
        />
      )}
    </div>
  );
}
