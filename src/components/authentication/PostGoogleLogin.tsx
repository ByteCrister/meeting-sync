"use client";

import { useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";

export default function PostGoogleLogin() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        console.log("Session:", session);
        console.log("Status:", status);

        const finalizeLogin = async () => {
            const res = await fetch("/api/auth/set-cookie");
            const data = await res.json() as { success: boolean };

            if (!data.success) {
                ShowToaster("Failed to set session cookie", "error");
                router.push("/user-authentication");
                return;
            }

            ShowToaster("Signed in successfully!", "success");
            setTimeout(() => {
                router.push("/");
            }, 1500);
        };

        if (status === "authenticated") {
            finalizeLogin();
        } else if (status === "unauthenticated") {
            ShowToaster("Google Sign-In failed.", "error");
            router.push("/user-authentication");
        }
    }, [status, router, session]);


    return <p>Signing you in...</p>;
}
