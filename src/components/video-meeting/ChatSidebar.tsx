"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Trash2 } from "lucide-react";
import { ChatSidebarProps } from "./types";

export function ChatSidebar({ messages, participants, onSendMessage, onDeleteMessage }: ChatSidebarProps) {
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage("");
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    };

    return (
        <div className="w-80 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Chat</h2>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.map((message) => {
                    const participant = participants.find(p => p.userId === message.userId);
                    return (
                        <div key={message._id} className="mb-4 group">
                            <div className="flex items-start space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={participant?.image} />
                                    <AvatarFallback>{participant?.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">{participant?.username}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">{message.message}</p>
                                </div>
                                <Button
                                    id={`delete-button-${message._id}`}
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900"
                                    onClick={() => onDeleteMessage(message._id)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </ScrollArea>
            <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                    <Input
                        is="video-call-input-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1"
                        autoComplete="off"
                        spellCheck={false}
                        autoCorrect="off"
                    />
                    <Button is="video-call-send-message" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 