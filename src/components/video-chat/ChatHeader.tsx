'use client';

import { DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';

interface Props {
  view: 'chat' | 'participants';
  setView: (v: 'chat' | 'participants') => void;
  participantCount: number;
}

export function ChatHeader({ view, setView, participantCount }: Props) {
  return (
    <DialogHeader
      className={clsx(
        'flex items-center justify-between px-4 py-3',
        'bg-gradient-to-tr from-indigo-900/10 via-purple-800/10 to-pink-900/10',
        'backdrop-blur-[12px] border-b border-gray-700/30'
      )}
    >
      <DialogTitle asChild>
        <VisuallyHidden>Group Chat</VisuallyHidden>
      </DialogTitle>

        <div className="flex space-x-4">
        {['chat', 'participants'].map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab as typeof view)}
            className={clsx(
              'relative py-1 px-3 text-sm font-medium transition-colors',
              view === tab
                ? 'text-white'
                : 'text-gray-300 hover:text-white',
              view === tab && 'after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-gray-300'
            )}
          >
            {tab === 'chat'
              ? 'Chat'
              : `Participants (${participantCount})`}
          </button>
        ))}
      </div>

      <DialogClose
        aria-label="Close chat"
        className="bg-white text-indigo-200 hover:text-white transition-colors"
      />
    </DialogHeader>
  );
}
