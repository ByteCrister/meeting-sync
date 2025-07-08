// 📁 src/lib/server/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import UserModel from "@/models/UserModel";
import ConnectDB from "@/config/ConnectDB";

declare global {
    interface Global {
        userId?: string;
    }
}

declare module "next-auth" {
    interface Session {
        token?: string;
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        token?: string;
        user_id?: string;
    }
}

interface DecodedToken {
    user_id: string;
    iat: number;
    exp: number;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            httpOptions: {
                timeout: 30000,
            },
        }),
    ],

    callbacks: {
        async signIn({ profile }) {
            if (!profile?.email) return false;

            try {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("DB Timeout")), 5000)
                );

                const startConn = Date.now();
                await Promise.race([ConnectDB(), timeout]);
                console.log("DB Connected in", Date.now() - startConn, "ms");

                const startFind = Date.now();
                const user = await UserModel.findOne({ email: profile.email }).exec();
                console.log("User found in", Date.now() - startFind, "ms");

                if (!user) throw new Error("EmailNotRegistered");
                (globalThis as Global).userId = user._id.toString();

                return true;
            } catch (err) {
                console.error("signIn error:", err);
                return false;
            }
        },
        async jwt({ token }) {
            try {
                const cookieStore = cookies();
                const rawToken = (await cookieStore).get(
                    process.env.NEXT_TOKEN!
                )?.value;

                // Handle login from credentials-based auth route
                if (rawToken) {
                    const decoded = jwt.verify(
                        rawToken,
                        process.env.JWT_SECRET!
                    ) as DecodedToken;
                    token.token = rawToken;
                    token.user_id = decoded.user_id;
                }

                // Handle login from Google
                if ((globalThis as Global).userId) {
                    token.user_id = (globalThis as Global).userId;
                    token.token = jwt.sign(
                        { user_id: token.user_id },
                        process.env.JWT_SECRET!,
                        {
                            expiresIn: "30d",
                        }
                    );
                }

                return token;
            } catch (err) {
                console.error("JWT callback error:", err);
                return token;
            }
        },

        async session({ session, token }) {
            session.token = token.token;
            if (session.user && token.user_id) {
                session.user.id = token.user_id;
            }
            return session;
        },
    },

    pages: {
        signIn: "/user-authentication",
        error: "/user-authentication/error",
    },

    secret: process.env.NEXTAUTH_SECRET!,
    debug: true,

    logger: {
        error(code, meta) {
            console.error("NEXTAUTH ERROR:", code, meta);
        },
        warn(code) {
            console.warn("NEXTAUTH WARN:", code);
        },
        debug(code, meta) {
            console.debug("NEXTAUTH DEBUG:", code, meta);
        },
    },
};
