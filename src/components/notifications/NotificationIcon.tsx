"use client";

import React, { useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ApiNotificationTypes, NotificationType } from "@/utils/constants";
import { addNotifications, resetCountOfNotifications } from "@/lib/features/users/userSlice";
import ApiStatusUpdate from "@/utils/client/api/api-status-update";
import NotificationCard from "./NotificationCard";
import { APIgetAllInitialNotifications } from "@/utils/client/api/api-notifications";
import { Notification } from "@/types/client-types";

const notificationRouteMap: Record<
  NotificationType,
  {
    path: string;
    paramField: keyof Notification;
  }
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


const NotificationIcon = () => {
  const { notifications, user } = useAppSelector((state) => state.userStore);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const responseData = await APIgetAllInitialNotifications();
      if (responseData.success) {
        dispatch(addNotifications(responseData.data as Notification[]));
      }
    };

    fetchData();
  }, [dispatch]);


  // ? API refresh unseen notification count
  const handleRefreshCount = async () => {
    if (user?.countOfNotifications !== 0) {
      const responseData = await ApiStatusUpdate(ApiNotificationTypes.REFRESH_NOTIFICATION);
      if (responseData.success) {
        console.log(responseData.data);
        dispatch(resetCountOfNotifications());
      }
    }
  };

  const getRoutingPath = (notification: Notification): string => {
    const routeInfo = notificationRouteMap[notification.type];
    if (!routeInfo) return "";
    return `${routeInfo.path}${notification[routeInfo.paramField]}`;
  };



  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={handleRefreshCount}
            className="relative p-2 rounded-full hover:bg-blue-100/40 transition cursor-pointer"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {user?.countOfNotifications !== 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-medium w-5 h-5 flex items-center justify-center rounded-full shadow">
                {user?.countOfNotifications}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[80vw] sm:w-[20rem] max-w-sm translate-x-3 sm:translate-x-0 rounded-xl border shadow-lg bg-white p-0 z-50 overflow-x-hidden"
        >
          <div className="p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Notifications
            </h3>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
            {notifications?.map((notification, index) => (
              <NotificationCard
                key={notification._id + notification.createdAt + index}
                getRoutingPath={getRoutingPath}
                notification={notification}
              />
            ))}
            {notifications?.length === 0 && (
              <div className="h-40 flex items-center justify-center text-sm text-gray-500">
                You have no notifications.
              </div>
            )}
          </div>

          <div className="p-4 border-t text-center text-sm text-gray-500">
            End of notifications
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationIcon;
