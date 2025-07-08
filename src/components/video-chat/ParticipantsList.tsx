'use client';

import { VideoCallParticipant } from '@/lib/features/videoMeeting/videoMeetingSlice';
import Image from 'next/image';

interface Props {
  participants: VideoCallParticipant[];
}

export function ParticipantsList({ participants }: Props) {
  return (
    <div
      className="
        flex-1 overflow-y-auto
        px-6 py-5 space-y-4
        scrollbar-thin scrollbar-thumb-pink-400/60 scrollbar-track-transparent
      "
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      {participants.map((p, i) => (
        <div
          key={`${p.userId}-${i}`}
          className="
            flex items-center gap-4
            py-3 px-4
            rounded-lg
            bg-white/5 hover:bg-white/10
            transition-all duration-200
            border border-white/10
            shadow-sm hover:shadow-md
          "
        >
          <Image
            src={p.image || '/default-avatar.png'}
            alt={p.username}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-pink-300/40 shadow-md"
          />
          <span className="text-white font-semibold tracking-wide text-sm">
            {p.username}
          </span>
        </div>
      ))}

      {participants.length === 0 && (
        <div className="text-pink-100 text-center py-10 italic">
          No participants yet.
        </div>
      )}
    </div>
  );
}
