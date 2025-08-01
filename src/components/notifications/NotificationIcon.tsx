"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ApiNotificationTypes, NotificationType } from "@/utils/constants";
import {
  addNotifications,
  deleteNotification,
  resetCountOfNotifications,
} from "@/lib/features/users/userSlice";
import ApiStatusUpdate from "@/utils/client/api/api-status-update";
import { APIdeleteNotification, APIgetAllInitialNotifications } from "@/utils/client/api/api-notifications";
import NotificationCard from "./NotificationCard";
import { Notification } from "@/types/client-types";
import ShadcnToast from "../global-ui/toastify-toaster/ShadcnToast";
import { CheckSquare, Trash2, ArrowLeftCircle } from "lucide-react";

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 18 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
};


// ——————————————————————————————————————————
// Routing helpers (unchanged)
// ——————————————————————————————————————————
const notificationRouteMap: Record<
  NotificationType,
  { path: string; paramField: keyof Notification }
> = {
  [NotificationType.FOLLOW]: {
    path: "/searched-profile?user=",
    paramField: "sender",
  },
  [NotificationType.SLOT_CREATED]: {
    path: "/meeting-post-feed?meeting-post=",
    paramField: "slot",
  },
  [NotificationType.SLOT_UPDATED]: {
    path: "/booked-meetings?meeting-slot=",
    paramField: "slot",
  },
  [NotificationType.SLOT_DELETED]: {
    path: "/searched-profile?user=",
    paramField: "sender",
  },
  [NotificationType.SLOT_BOOKED]: {
    path: "/searched-profile?user=",
    paramField: "sender",
  },
  [NotificationType.SLOT_UNBOOKED]: {
    path: "/booked-meetings?meeting-slot=",
    paramField: "sender",
  },
  [NotificationType.MEETING_TIME_STARTED]: {
    path: "/my-slots?slot=",
    paramField: "slot",
  },
  [NotificationType.MEETING_STARTED]: {
    path: "/booked-meetings?meeting-slot=",
    paramField: "slot",
  },
};

// ——————————————————————————————————————————
// Animated Notification Icon
// ——————————————————————————————————————————
const NotificationIcon = () => {
  const { notifications, user } = useAppSelector((s) => s.userStore);
  const dispatch = useAppDispatch();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  // Fetch initial notifications once on mount
  useEffect(() => {
    (async () => {
      const res = await APIgetAllInitialNotifications();
      if (res.success) dispatch(addNotifications(res.data as Notification[]));
    })();
  }, [dispatch]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications?.map((n) => n._id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    const res = await APIdeleteNotification(selectedIds);
    if (res.success) {
      dispatch(deleteNotification(selectedIds)); // update redux store
      setSelectedIds([]);
      ShadcnToast(res.message);
    }
  };

  // Refresh unseen‑count on click
  const handleRefreshCount = async () => {
    if (user?.countOfNotifications) {
      const res = await ApiStatusUpdate(ApiNotificationTypes.REFRESH_NOTIFICATION);
      if (res.success) dispatch(resetCountOfNotifications());
    }
  };

  const getRoutingPath = (n: Notification) =>
    `${notificationRouteMap[n.type]?.path ?? ""}${n[notificationRouteMap[n.type]?.paramField as keyof Notification]}`;

  const hasUnread = !!user?.countOfNotifications;

  return (
    <div className="relative">
      <Popover>
        {/* ——— Trigger ——— */}
        <PopoverTrigger asChild>
          <motion.button
            onClick={handleRefreshCount}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 group"
          >
            <Bell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />

            {/* —— Animated unread badge —— */}
            <AnimatePresence>
              {hasUnread && (
                <>
                  <motion.span
                    key="ring"
                    className="absolute -top-1.5 -right-1.5 inline-flex h-5 w-5 rounded-full bg-red-500/70"
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.7, 0, 0.7],
                    }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  />

                  <motion.span
                    key="badge"
                    className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[0.65rem] font-medium leading-none text-white shadow"
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {user?.countOfNotifications}
                  </motion.span>
                </>
              )}
            </AnimatePresence>

          </motion.button>
        </PopoverTrigger>

        {/* ——— Popover ——— */}
        <AnimatePresence>
          <PopoverContent
            align="end"
            sideOffset={8}
            /* Let Radix mount/unmount the popover; we animate only the inner div */
            asChild
            className="z-50 p-0 w-[80vw] sm:w-80 max-w-sm bg-white/90 backdrop-blur-md rounded-xl border shadow-xl overflow-hidden"
          >
            <motion.div
              key="popover"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 via-transparent to-transparent">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>

              {/* List */}
              {isBulkMode && (
                <div className="p-2 border-b flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === notifications?.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="accent-blue-500 scale-110"
                    />
                    <span className="hidden sm:inline-block">Select All</span>
                    <CheckSquare className="w-5 h-5 text-blue-500 sm:hidden" />
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsBulkMode(false)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-600 hover:text-blue-600 transition"
                      title="Back to normal"
                    >
                      <ArrowLeftCircle className="w-5 h-5" />
                      <span className="hidden sm:inline text-xs">Back</span>
                    </button>

                    <button
                      disabled={!selectedIds.length}
                      onClick={handleDeleteSelected}
                      className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-xs ${selectedIds.length
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-red-300 cursor-not-allowed"
                        } transition`}
                      title="Delete selected"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                {notifications?.length ? (
                  notifications.map((n) => (
                    <div key={n._id} className="flex items-start gap-2 p-3 rounded-md hover:bg-gray-100 transition">
                      {isBulkMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(n._id)}
                          onChange={() => handleToggleSelect(n._id)}
                          className="mt-2 accent-blue-500 scale-125 hover:ring-2 ring-blue-400 transition"
                        />
                      )}
                      <NotificationCard
                        notification={n}
                        getRoutingPath={getRoutingPath}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                      />
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                    You have no notifications.
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-4 text-center text-sm text-gray-500 border-t">
                End of notifications
              </div>
            </motion.div>
          </PopoverContent>
        </AnimatePresence>
      </Popover>
    </div>
  );
};

export default NotificationIcon;
