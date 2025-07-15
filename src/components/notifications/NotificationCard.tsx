"use client";

import { Notification } from "@/types/client-types";
import { BellOff, MoreVertical } from "lucide-react";
import getNotificationTime from "@/utils/client/others/getNotificationTime";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { updateNotification, deleteNotification } from "@/lib/features/users/userSlice";
import { APIupdateNotificationField, APIputChangePreference, APIdeleteNotification } from "@/utils/client/api/api-notifications";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import ShadcnToast from "../global-ui/toastify-toaster/ShadcnToast";
import { Trash2, X } from "lucide-react";

const NotificationCard = ({
    notification,
    getRoutingPath,
    isBulkMode = false,
    setIsBulkMode,
}: {
    notification: Notification;
    getRoutingPath: (notification: Notification) => string;
    isBulkMode?: boolean;
    setIsBulkMode?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"delete" | "notification" | null>(null);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const isClickInsideAny = Object.values(buttonRefs.current).some((ref) =>
                ref?.contains(target)
            );

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                !isClickInsideAny
            ) {
                setOpenMenus({});
                setMode(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => {
            const isOpen = prev[id];
            const updated: typeof prev = {};
            if (!isOpen) updated[id] = true;
            return updated;
        });
    };

    const handleRouting = async (notificationId: string) => {
        const routePath = getRoutingPath(notification);
        if (!routePath) return;

        router.push(routePath);

        const resIsClicked = await APIupdateNotificationField("isClicked", true, notificationId);
        const resIsRead = await APIupdateNotificationField("isRead", true, notificationId);

        if (resIsClicked.success && resIsRead.success) {
            dispatch(updateNotification({ field: "isClicked", value: true, _id: notificationId }));
            dispatch(updateNotification({ field: "isRead", value: true, _id: notificationId }));
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        const res = await APIdeleteNotification([notification._id]);
        if (res.success) {
            dispatch(deleteNotification(notification._id));
            ShadcnToast(res.message);
            setOpenMenus({});
            setMode(null);
        }
        setIsLoading(false);
    };

    const handleTogglePreference = async () => {
        setIsLoading(true);
        const res = await APIputChangePreference(notification.sender);
        if (res.success) {
            dispatch(updateNotification({
                field: "isDisable",
                value: res.isDisable!,
                _id: notification._id,
            }));
            ShadcnToast(res.message);
            setOpenMenus({});
            setMode(null);
        }
        setIsLoading(false);
    };

    return (
        <div
            key={notification._id}
            onClick={() => {
                if (Object.keys(openMenus).length > 0) return;
                handleRouting(notification._id);
            }}
            className={`
        relative flex items-start space-x-4 px-4 py-3 rounded-xl shadow-sm 
        transition-all duration-200 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-blue-100
        ${!notification.isRead ? "bg-gradient-to-r from-blue-50 to-white" : "bg-white"} 
        hover:bg-blue-50
      `}
        >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-blue-100 shadow-sm">
                {!notification.isClicked && (
                    <div className="absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center">
                        <span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                )}

                {notification.image ? (
                    <Image
                        src={notification.image}
                        width={48}
                        height={48}
                        alt={notification.sender}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">
                        No Image
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{notification.name}</p>
                <p className="text-sm text-gray-600 line-clamp-2 leading-snug">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                    {getNotificationTime(new Date(notification.createdAt))} ago
                </p>
            </div>

            <div className="relative min-w-[1.5rem] z-50" onClick={(e) => e.stopPropagation()}>
                <button
                    ref={(el) => {
                        buttonRefs.current[notification._id] = el;
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        toggleMenu(notification._id);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>


                <div
                    ref={dropdownRef}
                    className={`absolute right-0 top-6 w-48 z-50 bg-white rounded-md border shadow-md transition-all duration-200 ${openMenus[notification._id] ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                        }`}
                    style={{ transformOrigin: "top right" }}
                >
                    {isLoading ? (
                        <div className="p-4 flex justify-center items-center">
                            <LoadingSpinner />
                        </div>
                    ) : mode === "delete" ? (
                        <div className="p-4 text-center space-y-4 w-[250px] max-w-full">
                            <p className="text-sm text-gray-800 font-medium">
                                Are you sure you want to delete this notification?
                            </p>
                            <div className="flex justify-center flex-wrap gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setMode(null)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm border-gray-300 hover:bg-gray-100 text-gray-700 transition"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : mode === "notification" ? (
                        <div className="p-4 text-center space-y-4 w-[250px] max-w-full">
                            <p className="text-sm text-gray-800 font-medium flex justify-center items-center gap-2">
                                <BellOff className="w-4 h-4 text-gray-500" />
                                Toggle notifications from this user
                            </p>
                            <div className="flex justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        defaultChecked={notification.isDisable}
                                        className="sr-only peer"
                                        onChange={handleTogglePreference}
                                    />
                                    <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition duration-300 relative">
                                        <span className="absolute left-1 top-1 w-6 h-6 bg-white border rounded-full transition-transform peer-checked:translate-x-6"></span>
                                    </div>
                                </label>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setMode(null)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMode("notification");
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            >
                                Change preference
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMode("delete");
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                            >
                                Delete notification
                            </button>
                            {!isBulkMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenu(notification._id);
                                        setIsBulkMode?.(true);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer"
                                >
                                    Delete multiple
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;
