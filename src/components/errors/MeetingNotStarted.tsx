"use client";

import { MonitorPause } from "lucide-react";
import React from "react";

interface MeetingNotStartedProps {
    message?: string;
}

const MeetingNotStarted: React.FC<MeetingNotStartedProps> = ({
    message = "Meeting has not started yet. The host has not joined.",
}) => {

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center text-center px-4">
            <MonitorPause className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">{message}</h2>
            <p className="text-gray-500 mt-2">Please wait for the host to join the meeting room.</p>
        </div>
    );
};

export default MeetingNotStarted;
