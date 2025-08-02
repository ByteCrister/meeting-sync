import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "./ClientProvider";
import NotificationSocketProvider from "@/utils/socket/NotificationSocketProvider";
import ForceLightMode from "@/components/global-ui/ui-component/ForceLightMode";
import TopLoadingBar from "@/components/global-ui/ui-component/TopLoadingBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://meeting-sync-beta.vercel.app/"),
  title: {
    default: "MetingSync",
    template: "%s | MetingSync",
  },
  description: "Meeting Sync is an intelligent meeting scheduling and video conferencing platform that implements real-time WebRTC communication, automated cron-based lifecycle management, and AI-powered analytics using TF-IDF and k-means clustering. The platform provides end-to-end meeting management from slot creation through video conferencing to engagement analytics.",

  applicationName: "MetingSync",
  keywords: ["meetings", "scheduling", "calendar", "team management", "productivity", "Next.js", 'Sadiqul Islam Shakib', 'Custom TF-IDF & Clustering', 'NextAuth.js', 'WebRTC + Socket.IO', '	Fuse.js', 'Redis', 'Redux Toolkit', 'Tailwind CSS', 'TypeScript'],
  authors: [{ name: "Sadiqul Islam Shakib", url: "https://meeting-sync-beta.vercel.app/" }],
  creator: "Sadiqul Islam Shakib",
  publisher: "MetingSync",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meeting-sync-beta.vercel.app/",
    title: "MetingSync | Smart Meeting Scheduler",
    description: "Smart scheduling, real-time updates, and seamless team meetings.",
    siteName: "MetingSync",
    images: [
      {
        url: "/images/meeting-sync-1.png", // Your Open Graph banner image
        width: 1200,
        height: 630,
        alt: "MetingSync - Smart Meeting Scheduler",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MetingSync | Smart Meeting Scheduler",
    description: "Easily schedule and manage your meetings with MetingSync.",
    // creator: "@metingsync", // if you have a Twitter handle
    images: ["https://yourdomain.com/twitter-card.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "mask-icon",
      url: "/safari-pinned-tab.svg",
      color: "#5bbad5",
    },
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  alternates: {
    canonical: "https://meeting-sync-beta.vercel.app/",
  },

  category: "video conferencing and scheduling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopLoadingBar />
        <ForceLightMode />
        <ClientProvider>
          <NotificationSocketProvider />
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
