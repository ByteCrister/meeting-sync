"use client";

import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { registerSlot } from '@/types/client-types';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import LoaderBars from '../global-ui/ui-component/LoaderBars';
import { decreaseBookedUsers } from '@/lib/features/Slots/SlotSlice';
import { getPopBookedUsers, performPopBlockUser, performPopRemoveUser, performUndoPopUserRemove } from '@/utils/client/api/api-booked-users';

const BookUsersPopover = ({ Slot }: { Slot: registerSlot }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBlockLoading, setIsBlockLoading] = useState<boolean>(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<{ _id: string; username: string; email: string; image: string, isRemoved: boolean; }[]>([]);
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    const resData = await getPopBookedUsers(Slot._id);
    if (resData.success) {
      setUsers(resData.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUserClick = (userId: string) => {
    router.push(`/searched-profile?user=${userId}`);
  };

  const handleUserBlock = async (userId: string, slotId: string) => {
    setIsBlockLoading(true);
    const resData = await performPopBlockUser(userId, slotId);
    if (resData.success) {
      await handlerUserRemove(userId, slotId, true);
    }
    setIsBlockLoading(false);
  };

  const handlerUserRemove = async (
    userId: string,
    slotId: string,
    calledFromBlock = false
  ) => {
    if (!calledFromBlock) setIsRemoveLoading(true);
    const resData = await performPopRemoveUser(userId, slotId);
    if (resData.success) {
      if (calledFromBlock) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        decreaseBookedUsers({ bookedUserId: userId, sloId: slotId });
      } else {
        setUsers(prev => [...prev.map((user) => user._id === userId ? { ...user, isRemoved: true } : user)]);
      }
    }
    if (!calledFromBlock) setIsRemoveLoading(false);
  };


  const handleUndoRemove = async (userId: string, slotId: string) => {
    setIsRemoveLoading(true);
    const resData = await performUndoPopUserRemove(userId, slotId);
    if (resData.success) {
      setUsers(prev => [...prev.map((user) => user._id === userId ? { ...user, isRemoved: false } : user)]);
    }
    setIsRemoveLoading(false);
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id="booked-user-popover" className="cursor-pointer">
          <div className="flex items-center text-sm text-gray-500 hover:underline">
            <Users className="w-4 h-4 mr-1" />
            {Slot?.bookedUsers?.length || 0} bookings
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <h3 className="text-sm font-semibold mb-2">Booked Users</h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 bg-neutral-300 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-neutral-200" />
                  <Skeleton className="h-3 w-1/2 bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        ) : users?.length === 0 ? (
          <p className="text-sm text-gray-500">No users have booked this slot yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {users?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between space-x-3 hover:bg-gray-50 p-2 rounded-md"
              >
                <div onClick={() => handleUserClick(user._id)} className="flex items-center space-x-3 cursor-pointer">
                  <Avatar>
                    <AvatarImage src={user.image} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm group">
                    <p className="font-medium group-hover:underline">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {
                    isRemoveLoading ? <LoaderBars />
                      : user.isRemoved
                        ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  id="undo-remove"
                                  className="text-xs px-2 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600"
                                  onClick={() => handleUndoRemove(user._id, Slot._id)}
                                >
                                  Undo
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-white bg-gray-800">
                                Re-add user to bookings
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                        : (<button
                          id='remove-user'
                          disabled={isRemoveLoading}
                          className="text-xs px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-600"
                          onClick={() => handlerUserRemove(user._id, Slot._id)} // Replace with real handler
                        >
                          Remove
                        </button>)
                  }

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {
                          isBlockLoading ? <LoaderBars />
                            : (<button
                              id='block-user'
                              disabled={isBlockLoading}
                              className="text-xs px-2 py-1 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
                              onClick={() => handleUserBlock(user._id, Slot._id)} // Replace with real handler
                            >
                              Block
                            </button>)
                        }
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-white max-w-[200px] bg-gray-800 fill-gray-800">
                        Block user by booking this meeting
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BookUsersPopover;