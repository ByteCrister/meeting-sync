// src>app>api>auth>user>validity

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/utils/server/verifyToken";
import UserModel from "@/models/UserModel";

export async function GET(request: NextRequest) {
    const tokenKey = process.env.NEXT_TOKEN;
    if (!tokenKey) {
        return NextResponse.json(
            { message: "Token key is not configured" },
            { status: 500 }
        );
    }

    // Retrieve token from cookies
    const token = request.cookies.get(tokenKey)?.value || "";

    if (!token) {
        // No token found; user is unauthorized
        return NextResponse.json(
            { message: "Unauthorized: No token provided" },
            { status: 401 }
        );
    }

    try {
        // Verify the token; adjust verifyToken based on your implementation
        const payload = await verifyToken(token);

        // Optionally, fetch user details from your database here using payload
        // For example: const user = await getUserById(payload.id);
        const userId = payload && payload.user_id
            ? payload.user_id
            : null;

        // If the userPayload is found, return the userPayload data
        const user = await UserModel.findById(userId).select("-password"); // Exclude password

        // If no user is found based on valid token payload, clear the token
        if (!user) {
            const response = NextResponse.json(({ success: false, message: "User not found" }), { status: 404 });
            response.cookies.delete(tokenKey);
            return response;

        } else {
            return NextResponse.json({ success: true, message: "User founded.", user }, { status: 200 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        // The token is invalid or expired. Remove the cookie.
        const response = NextResponse.json(
            { message: "Unauthorized: Invalid token" },
            { status: 401 }
        );
        response.cookies.delete(tokenKey);
        return response;
    }
}
