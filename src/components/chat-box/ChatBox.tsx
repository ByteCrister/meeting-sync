'use client';

import { SendHorizonal, Trash2, Check, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChatBoxSkeleton from './ChatBoxSkeleton';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    deleteMessage,
    getChatMessages,
    sendMessage,
} from '@/utils/client/api/api-chat-box';
import { ApiChatBoxMessageType } from '@/utils/constants';
import {
    addNewMessage,
    deleteChatMessage,
    setActiveUserChats,
} from '@/lib/features/chat-box-slice/chatBoxSlice';
import { chatBoxUserChatType } from '@/types/client-types';

export default function ChatBox() {
    const currentUserId = useAppSelector(state => state.userStore.user?._id);
    const participantId = useAppSelector(state => state.chatBoxStore.activeUserChat.user?._id);
    const chatMessages = useAppSelector(state => state.chatBoxStore.activeUserChat.chats);
    const isUserListOpen = useAppSelector(state => state.componentStore.viewMessageUserList.isOpen);
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if(!isUserListOpen){
            const fetchData = async () => {
                setLoading(true);
                const chatMessageData = await getChatMessages(ApiChatBoxMessageType.GET_MESSAGES, participantId);
                dispatch(setActiveUserChats(chatMessageData as chatBoxUserChatType[]));
                setLoading(false);
            };
            fetchData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUserListOpen, participantId]);

    useEffect(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        const data = await sendMessage(participantId!, message);
        if (data) {
            dispatch(addNewMessage(data));
        }
        setMessage('');
    };

    const handleDeleteMessage = async (messageId: string) => {
        const isMessageDeleted = await deleteMessage(participantId!, messageId);
        if (isMessageDeleted) {
            dispatch(deleteChatMessage(messageId));
        }
    };

    if (loading) return <ChatBoxSkeleton />;

    return (
        <div className="flex flex-col w-full max-h-[500px] bg-white rounded-xl overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 messages-container">
                {chatMessages.map((msg, index) => {
                    const isOwn = currentUserId === msg.user_id;
                    const isSeen = msg.seen;
                    return (
                        <div
                            key={msg._id + index}
                            className={`group relative w-fit max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isOwn
                                ? 'ml-auto bg-black text-white'
                                : 'mr-auto bg-white text-gray-900 border'
                                }`}
                        >
                            <div>{msg.message}</div>

                            {/* Seen/Sent check mark */}
                            {isOwn && (
                                <div className="flex items-center gap-1 mt-1 justify-end text-xs text-gray-400">
                                    {isSeen ? (
                                        <CheckCheck className="w-4 h-4 text-blue-500" />
                                    ) : (
                                        <Check className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            )}

                            {/* Delete */}
                            {isOwn && (
                                <button
                                    onClick={() => handleDeleteMessage(msg._id)}
                                    className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 hover:bg-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                                    title="Delete message"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                autoComplete="off"
                className="flex items-center gap-2 p-3 border-t bg-white"
            >
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-400 shadow-sm transition duration-200"
                    placeholder="Type your message..."
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 transition"
                >
                    <SendHorizonal className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}