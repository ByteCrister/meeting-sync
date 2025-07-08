// src/app/api/auth/set-cookie/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/server/authOptions";

export async function GET() {
    const session = await getServerSession(authOptions);
    console.log("[Set Cookie] Session:", session);

    if (!session?.user?.id || !session?.token) {
        return NextResponse.json({ success: false });
    }

    const response = NextResponse.json({ success: true });

    // Set cookie
    response.cookies.set({
        name: "auth_token",
        value: session.token,
        httpOnly: false,
        secure: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}
