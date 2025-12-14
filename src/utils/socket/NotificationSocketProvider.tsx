// src/components/utils/client/socket/NotificationSocketProvider.tsx
"use client";

import SocketWarningDialog from "@/components/global-ui/dialoges/SocketWarningDialog";
import useNotificationSocket from "@/hooks/useNotificationSocket";


const NotificationSocketProvider = () => {
  useNotificationSocket(); 
  return <SocketWarningDialog />; 
};

export default NotificationSocketProvider;