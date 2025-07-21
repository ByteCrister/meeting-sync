import Profile from "@/components/profile/Profile";
import axios, { AxiosError } from "axios";
import { Metadata } from "next";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Convert cookies to header format
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join("; ");
  const baseURL = process.env.NEXT_PUBLIC_DOMAIN!;

  // If no cookie exists, return default metadata right away
  if (!cookieHeader || cookieHeader.trim() === "") {
    return {
      metadataBase: new URL(baseURL),
      title: "Profile | MeetingSync",
      openGraph: {
        title: "Profile | MeetingSync",
        description: "Effortlessly schedule meetings with MeetingSync.",
        images: [],
      },
    };
  }

  try {
    const res = await axios.get(`${baseURL}/api/auth/user/validity`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const user = res.data.user;

    if (user?.username) {
      return {
        metadataBase: new URL(baseURL),
        title: `${user.username} | MeetingSync`,
        openGraph: {
          title: `${user.username} | MeetingSync`,
          description: `Welcome back, ${user.username}!`,
          images: user.image ? [user.image] : [],
        },
      };
    }
  } catch (err: unknown) {
    // If the error is a 401 (unauthenticated), it’s expected. We can simply fallback.
    if ((err as AxiosError)?.response && (err as AxiosError)?.response?.status === 401) {
      console.log("User not authenticated; using default metadata.");
    } else {
      console.error("Failed to fetch user for metadata:", (err as AxiosError)?.response?.data);
    }
  }

  // Return default metadata if user info is not available.
  return {
    metadataBase: new URL(baseURL),
    title: "Home | MeetingSync",
    openGraph: {
      title: "Home | MeetingSync",
      description: "Effortlessly schedule meetings with MeetingSync.",
      images: [],
    },
  };
}

export default function Page() {
  return (
    <Profile />
  );
}
