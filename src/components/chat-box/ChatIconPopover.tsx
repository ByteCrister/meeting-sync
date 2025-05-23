"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import NewMessageDialog from "./NewMessageDialog";
import { BiMessageDetail } from "react-icons/bi";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getLastParticipants, toggleChatBoxStatus } from "@/utils/client/api/api-chat-box";
import { ApiChatBoxMessageType } from "@/utils/constants";
import { setChatBoxActiveUser, setChatBoxStatus, setCountOfUnseenMessage } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { toggleChatBox, toggleMessageUserList } from "@/lib/features/component-state/componentSlice";

export default function ChatIconPopover() {
    const unseenMessagesCount = useAppSelector(state => state.chatBoxStore.countOfUnseenMessages);
    const activeParticipant = useAppSelector(state => state.chatBoxStore.activeUserChat.user);
    const isUserListOpen = useAppSelector(state => state.componentStore.viewMessageUserList.isOpen);
    const isPopOverOpen = useAppSelector(state => state.componentStore.viewChatBox.isOpen);
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const responseData = await getLastParticipants(ApiChatBoxMessageType.GET_ACTIVE_USER);
            dispatch(setChatBoxActiveUser(responseData.data));
            dispatch(setCountOfUnseenMessage(responseData.count));
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeParticipant?._id]);

    const openPopoverFromDialog = async () => {
        setIsUserListOpen(false);
        // console.log(`****openPopoverFromDialog: ${true}`);
        await toggleChatBoxStatus(true);
        dispatch(toggleChatBox({ isOpen: true }));
        dispatch(setChatBoxStatus(true));
    };

    const setIsUserListOpen = async (isOpen: boolean) => {
        dispatch(toggleMessageUserList({ isOpen: isOpen }));
    }

    // * Handle open/close to this Popover
    const handlePopOver = async (open: boolean) => {
        dispatch(toggleChatBox({ isOpen: open }));
        // console.log(`*****handlePopOver: ${open}`);
        await toggleChatBoxStatus(open);
    };

    return (
        <>
            <Popover open={isPopOverOpen} onOpenChange={handlePopOver}>
                <PopoverTrigger asChild>
                    <button
                        onClick={() => {
                            setIsUserListOpen(true);
                        }} // Open dialog instead of popover
                        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <BiMessageDetail className="w-5 h-5" />
                        {unseenMessagesCount !== 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full shadow-md">
                                {unseenMessagesCount}
                            </span>
                        )}
                    </button>
                </PopoverTrigger>

                <PopoverContent className="w-[85vw] sm:w-96 max-w-sm p-4 absolute right-2 sm:right-4 top-16 translate-x-4 bg-white sm:translate-x-0 shadow rounded-xl">
                    {!activeParticipant?._id ? (
                        <div className="h-[300px] flex items-center justify-center">
                            You have no friend.
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-10 w-10 bg-neutral-200 rounded-full" />
                                        <Skeleton className="h-5 w-40 bg-neutral-200 rounded" />
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Image
                                            src={activeParticipant?.image || ""}
                                            alt="User Avatar"
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                        <span className="font-semibold text-gray-700">{activeParticipant?.username}</span>
                                    </div>
                                )}

                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                id="chat-with-other-"
                                                type="button"
                                                onClick={() => { setIsUserListOpen(true) }}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white text-sm p-2 rounded-lg">
                                            <p>Chat with Friend</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Separator line */}
                            <hr className="my-2 border-gray-200" />

                            {/* Chat box container */}
                            <div className="flex flex-col justify-end h-80">
                                <ChatBox />
                            </div>
                        </>
                    )}
                </PopoverContent>
            </Popover>

            <NewMessageDialog
                open={isUserListOpen}
                onOpenChange={setIsUserListOpen}
                onContinueToChatBox={openPopoverFromDialog}
            />
        </>
    );
}