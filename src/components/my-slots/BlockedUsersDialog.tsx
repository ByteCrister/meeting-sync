'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '../ui/skeleton'
import { getAllPopBlockedUsers, performPopUnBlockUser } from '@/utils/client/api/api-booked-users'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleBlockedUsersDialog } from '@/lib/features/component-state/componentSlice'
import LoaderBars from '../global-ui/ui-component/LoaderBars'

type User = {
    _id: string
    username: string
    email: string
    image: string
}


export default function BlockedUsersDialog() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [unblockingId, setUnblockingId] = useState<string | null>(null);
    const { isOpen, slotId } = useAppSelector(state => state.componentStore.blockedUsersDialog);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!isOpen) return

        const fetchBlockedUsers = async () => {
            setLoading(true);
            const resData = await getAllPopBlockedUsers(slotId || "");
            if (resData.success) {
                setUsers(resData.data)
            }
            setLoading(false);
        };

        fetchBlockedUsers()
    }, [isOpen, slotId])

    const handleUnblock = async (userId: string) => {
        setUnblockingId(userId);
        const resData = await performPopUnBlockUser(userId, slotId || "");
        if (resData.success) {
            setUsers(prev => prev.filter(user => user._id !== userId));
        }
        setUnblockingId(null);
    };

    const setOpen = (open: boolean) => {
        dispatch(toggleBlockedUsersDialog({ isOpen: open, slotId: open ? slotId : null }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen} >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Blocked Users</DialogTitle>
                    <DialogDescription>Manage the users you&apos;ve blocked in this slot.</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="p-4">
                        <BlockedUsersSkeleton />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No blocked users found.</div>
                ) : (
                    <ScrollArea className="max-h-[300px] space-y-4 pr-2">
                        {users.map((user) => (
                            <div key={user._id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.image} alt={user.username} />
                                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <Button
                                    id="unblock-user"
                                    variant="destructive"
                                    size="sm"
                                    disabled={unblockingId === user._id}
                                    onClick={() => handleUnblock(user._id)}
                                    className="min-w-[100px] flex justify-center items-center px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {unblockingId === user._id ? (
                                        <LoaderBars />
                                    ) : (
                                        'Unblock'
                                    )}
                                </Button>

                            </div>
                        ))}
                    </ScrollArea>
                )}
            </DialogContent>
            <DialogClose asChild></DialogClose>
        </Dialog>
    )
};

// * Loading skeleton
function BlockedUsersSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 bg-neutral-300 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32 bg-neutral-200" />
                            <Skeleton className="h-3 w-40 bg-neutral-200" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    )
};