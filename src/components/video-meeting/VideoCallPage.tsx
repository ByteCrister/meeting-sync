"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import VideoCallMeeting from "./VideoCallMeeting";
import MeetingNotStarted from "../errors/MeetingNotStarted";
import VideoCallPageWrapper from "./VideoCallPageWrapper";
import { setMeetingDetails, VideoCallStatus } from "@/lib/features/videoMeeting/videoMeetingSlice";
import { useEffect, useRef, useState } from "react";
import { apiGetVideoCallStatus, apiJoinVideoCall } from "@/utils/client/api/api-video-meeting-call";
import { VideoCallErrorTypes } from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import LoadingUi from "../global-ui/ui-component/LoadingUi";
import FullPageError from "../errors/FullPageError";
import { videoErrorMessages } from "@/utils/error-messages/messages";

export default function VideoCallPage() {
    const userId = useAppSelector((state) => state.userStore.user?._id || "");
    const meeting = useAppSelector((state) => state.videoMeeting);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [videoStatus, setVideoStatus] = useState<VideoCallErrorTypes | null>(null);
    const searchParams = useSearchParams();
    const roomId = searchParams?.get('roomId') || '';
    // Prevent duplicate re-joining
    const hasRejoined = useRef(false);

    useEffect(() => {
        // 1. API Call to get video call status
        const getValidation = async () => {
            const videoCallStatusData = await apiGetVideoCallStatus(roomId);
            if (videoCallStatusData.isError) {
                setVideoStatus(videoCallStatusData.errorType);
                setIsLoading(false);
                return;
            }
            // 2. API Call to join the video call
            const joinStatusData = await apiJoinVideoCall(roomId);
            if (
                joinStatusData.success &&
                joinStatusData?.meetingStatus === VideoCallStatus.WAITING
            ) {
                setIsLoading(false);
                return;
            } else if (joinStatusData.success && joinStatusData?.meeting) {
                dispatch(setMeetingDetails(joinStatusData.meeting));
                setIsLoading(false);
            } else if (!joinStatusData.success) {
                setVideoStatus(VideoCallErrorTypes.MEETING_NOT_FOUND);
                setIsLoading(false);
                return;
            }
        };

        getValidation();

    }, [dispatch, roomId]);

    useEffect(() => {
        const tryRejoinMeeting = async () => {
            // If already rejoined or not in WAITING state, exit
            if (hasRejoined.current || meeting.status !== VideoCallStatus.ACTIVE) return;

            const joinStatusData = await apiJoinVideoCall(roomId);
            if (joinStatusData.success && joinStatusData.meeting) {
                dispatch(setMeetingDetails(joinStatusData.meeting));
                hasRejoined.current = true;
            }
        };

        tryRejoinMeeting();
    }, [meeting.status, dispatch, roomId]);


    if (isLoading) return <LoadingUi />;

    if (!roomId) {
        return <FullPageError message="Room ID is missing from the URL." />;
    }

    if (videoStatus) {
        return <FullPageError message={videoErrorMessages[videoStatus]} />;
    }

    return (
        <VideoCallPageWrapper>
            {meeting.status === VideoCallStatus.WAITING &&
                userId !== meeting.hostId ? (
                <MeetingNotStarted />
            ) : (
                <VideoCallMeeting roomId={roomId} />
            )}
        </VideoCallPageWrapper>
    );
}
