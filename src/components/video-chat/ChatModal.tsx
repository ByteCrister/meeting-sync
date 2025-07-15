'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { useChat } from '../../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatBody } from './ChatBody';
import { ChatFooter } from './ChatFooter';
import { AnimatePresence, motion } from 'framer-motion';

export function ChatModal({
  roomId,
  setIsChatModalOpen,
  unSeenMessages,
  clearUnSeenMessages,
}: {
  roomId: string;
  setIsChatModalOpen: Dispatch<SetStateAction<boolean>>;
  unSeenMessages: number;
  clearUnSeenMessages: () => void;
}) {
  const { messages, participants, sendMessage, deleteMessage } = useChat(roomId);
  const [draft, setDraft] = useState('');
  const [view, setView] = useState<'chat' | 'participants'>('chat');
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    sendMessage(draft);
    setDraft('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setIsChatModalOpen(isOpen);
    if (isOpen) {
      clearUnSeenMessages();
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed md:top-auto md:left-auto md:bottom-6 md:right-6"
        >
          <div className="relative">
            <Button variant="default" aria-label="Open group chat">
              <svg
                className="relative z-10 w-6 h-6 mx-auto mt-[1px] text-white drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M2 2h20v16H5l-3 3V2z" />
              </svg>
            </Button>

            {unSeenMessages > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 shadow">
                {unSeenMessages}
              </div>
            )}
          </div>
        </motion.div>
      </DialogTrigger>

      <AnimatePresence initial={false} mode="wait">
        {open && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <DialogContent
              forceMount
              className={clsx(
                'flex flex-col w-full max-w-md h-full max-h-[90vh]',
                'p-0 m-0',
                'bg-gradient-to-tr from-indigo-900/10 via-purple-800/10 to-pink-900/10',
                'backdrop-blur-[12px] border border-gray-700/30',
                'shadow-lg',
                'rounded-2xl overflow-hidden'
              )}
            >
              <ChatHeader
                view={view}
                setView={setView}
                participantCount={participants.length}
              />

              <div className="flex-1 overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={view}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="h-full overflow-auto"
                  >
                    <ChatBody
                      view={view}
                      messages={messages}
                      deleteMessage={deleteMessage}
                      participants={participants}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {view === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatFooter
                    draft={draft}
                    setDraft={setDraft}
                    onSend={handleSend}
                  />
                </motion.div>
              )}
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}