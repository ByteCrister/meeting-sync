import VideoCallClient from "@/components/video-meeting/VideoCallClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Video-Meeting',
};

const Page = () => {
    return (
        <VideoCallClient />
    )
};

export default Page