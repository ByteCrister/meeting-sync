'use client';

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { setChatBoxActiveUser, setChatBoxUserList, setCountOfUnseenMessage } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getChatBoxUserList } from "@/utils/client/api/api-chat-box";
import UserListSkeleton from "./UserListSkeleton";

// Debounce utility
function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default function UserList({
    onOpenChange,
    onContinueToChatBox,
}: {
    onOpenChange: (open: boolean) => void;
    onContinueToChatBox: () => void;
}) {
    const users = useAppSelector(state => state.chatBoxStore.chatBoxUserList);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 400); // 400ms debounce

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getChatBoxUserList();
            dispatch(setChatBoxUserList(data));
            dispatch(setCountOfUnseenMessage(0));
            setLoading(false);
        };
        fetchData();
    }, [dispatch]);

    const handleContinue = (selectedEmail: string) => {
        const selectedUser = users.find(user => user.email === selectedEmail);
        if (selectedUser) {
            dispatch(setChatBoxActiveUser(selectedUser));
            onOpenChange(false);
            onContinueToChatBox();
        }
    };

    // Filter users with debounce and searching state
    const filteredUsers = useMemo(() => {
        if (debouncedSearchTerm.trim() === "") {
            setSearching(false);
            return users;
        }

        setSearching(true);
        const result = users.filter(user =>
            user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setTimeout(() => setSearching(false), 200); // simulate delay for UI feedback
        return result;
    }, [debouncedSearchTerm, users]);

    if (loading) return <UserListSkeleton />;

    return (
        <div className="mt-4 flex flex-col max-h-64">
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-3 p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            {searching && (
                <div className="mb-2 text-xs text-gray-500">Searching...</div>
            )}

            {/* Scrollable user list */}
            {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] text-sm text-gray-500">
                    No users found.
                </div>
            ) : (
                <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                    {filteredUsers.map((user, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-md cursor-pointer transition hover:bg-gray-100"
                            onClick={() => handleContinue(user.email)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative w-10 h-10">
                                    <Image
                                        src={user.image}
                                        width={40}
                                        height={40}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {user.online ? (
                                        <>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full opacity-75 animate-pulse" />
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                                        </>
                                    ) : (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full ring-2 ring-white" />
                                    )}
                                    {user.newUnseenMessages > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1 rounded-full">
                                            {user.newUnseenMessages}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user.username}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}