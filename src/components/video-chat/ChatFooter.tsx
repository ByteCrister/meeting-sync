'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyboardEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface Props {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}

export function ChatFooter({ draft, setDraft, onSend }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className="
        flex items-center px-6 py-3
        bg-gradient-to-tr from-gray-900/20 to-gray-800/20
        backdrop-blur-md border-t border-gray-700/50
      "
    >
      <Input
        placeholder="Type a message…"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKey}
        aria-label="Message input"
        className="
          flex-1 h-10
          bg-gray-700/30 border border-gray-600/40
          text-white placeholder-gray-400
          rounded-lg px-4
          focus:bg-gray-700/50 focus:ring-2 focus:ring-cyan-300
          transition
        "
      />

       <Button
        onClick={onSend}
        className="
          ml-3 p-3
          bg-pink-600 text-white
          rounded-full
          hover:bg-pink-700 active:scale-95
          transition
        "
        aria-label="Send message"
      >
        <FaPaperPlane size={18} />
      </Button>
    </div>
  );
}
