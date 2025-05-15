'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { VideoCallInterface } from "./VideoCallInterface";

const Default = () => {
    const searchParams = useSearchParams();
    const meetingId = searchParams?.get('meetingId');
    const router = useRouter();

    const onEndCall = () => {
        router.back();
    };

    return (
        <VideoCallInterface
            meetingId={meetingId!}
            onEndCall={onEndCall}
        />
    );
};

export default Default;
