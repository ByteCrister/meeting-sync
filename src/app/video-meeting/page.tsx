export const dynamic = "force-dynamic";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Video-Meeting",
};

import VideoCallMeeting from "@/components/video-meeting/VideoCallMeeting";
const Page = () => {
  return <VideoCallMeeting />
};

export default Page;