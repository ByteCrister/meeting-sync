export const dynamic = "force-dynamic";

import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Video-Meeting",
};

import VideoCallClient from "@/components/video-meeting/VideoCallClient";

const Page = () => {
    return <VideoCallClient />;
};

export default Page;
