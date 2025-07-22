// 📁 src/app/api/auth/custom-google-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/server/authOptions";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.redirect(new URL("/user-authentication?error=SessionNotFound", req.url));
    }

    const token = jwt.sign({ user_id: session.user.id }, process.env.JWT_SECRET!, {
        expiresIn: "30d",
    });

    const res = NextResponse.redirect(new URL("/profile", req.url));
    res.cookies.set(process.env.NEXT_TOKEN!, token, {
        httpOnly: false,
        secure: false,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
    });

    return res;
}
