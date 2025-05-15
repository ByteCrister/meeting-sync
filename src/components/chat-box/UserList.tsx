'use client';

import { setChatBoxActiveUser, setChatBoxUserList } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getChatBoxUserList } from "@/utils/client/api/api-chat-box";
import { useEffect, useState } from "react";
import UserListSkeleton from "./UserListSkeleton";
import Image from "next/image";
import { Check } from "lucide-react";

export default function UserList({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    const users = useAppSelector(state => state.chatBoxStore.chatBoxUserList);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getChatBoxUserList();
            dispatch(setChatBoxUserList(data));
            setLoading(false);
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <UserListSkeleton />


    const handleContinue = () => {
        // console.log(`User List:` + JSON.stringify(users, null, 2));
        dispatch(setChatBoxActiveUser(users.find((user) => user.email === selectedEmail)!));
        onOpenChange(false);
    }

    return (
        <div className="mt-4 flex flex-col max-h-64">
            {/* Scrollable user list */}

            {
                users.length === 0 ?
                    (<div className="flex items-center justify-center h-[300px]">
                        You have no friend&apos;s yet.
                    </div>)

                    : (<div className="space-y-2 overflow-y-auto pr-1 flex-1">
                        {users.map((user, i) => {
                            const isSelected = user.email === selectedEmail;

                            return (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition hover:bg-gray-100 ${isSelected ? "bg-gray-100" : ""
                                        }`}
                                    onClick={() => setSelectedEmail(isSelected ? null : user.email)}
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

                                    {/* Checkmark for selected user */}
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-gray-600 shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>)

            }

            {/* Continue button (stays in place) */}
            <div className="pt-2">
                <button
                    name="handle-continue"
                    onClick={handleContinue}
                    className="w-full py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm">
                    Continue
                </button>
            </div>
        </div>
    );
}
