export const dynamic = "force-dynamic";
import VideoCallPage from "@/components/video-meeting/VideoCallPage";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Video-Meeting",
};

const Page = () => {
  return <VideoCallPage />
};

export default Page;