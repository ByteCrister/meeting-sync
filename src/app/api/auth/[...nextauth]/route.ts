import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import UserModel from "@/models/UserModel";
import ConnectDB from "@/config/ConnectDB";

declare global {
	interface Global {
		authPerformed?: "signin" | "signup";
		userId?: string;
	}
}

declare module "next-auth" {
	interface Session {
		token?: string;
		performed?: "signin" | "signup";
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		token?: string;
		performed?: "signin" | "signup";
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ profile }) {
			console.log("[Google SignIn] Profile email:", profile?.email);

			if (!profile?.email) {
				return "/user-authentication?error=MissingEmail";
			}

			await ConnectDB();
			const user = await UserModel.findOne({ email: profile.email });
			console.log("[Google SignIn] Found user:", user);

			if (!user) {
				return "/user-authentication?error=EmailNotRegistered";
			}

			// Generate custom JWT token
			const token = jwt.sign(
				{ user_id: user._id },
				process.env.JWT_SECRET!,
				{ expiresIn: "30d" }
			);

			// Set cookie (exactly like your custom sign-in)
			const cookieStore = await cookies();
			cookieStore.set(process.env.NEXT_TOKEN!, token, {
				httpOnly: false,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 30, // 30 days
			});

			(globalThis as Global).authPerformed = "signin";
			(globalThis as Global).userId = user._id.toString();

			return true;
		},

		async jwt({ token }) {
			try {
				await ConnectDB();
				const user = await UserModel.findOne({ email: token.email });

				if (user) {
					token.token = jwt.sign(
						{ user_id: user._id },
						process.env.JWT_SECRET!,
						{ expiresIn: "30d" }
					);
				}

				token.performed = (globalThis as Global).authPerformed ?? "signin";
				token.sub = (globalThis as Global).userId ?? token.sub;

				return token;
			} catch (error) {
				console.error("JWT callback error:", error);
				return token;
			}
		},

		async session({ session, token }) {
			session.token = token.token;
			session.performed = token.performed;
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	pages: {
		signIn: "/user-authentication",
		error: "/user-authentication",
	},
	secret: process.env.NEXTAUTH_SECRET!,
	debug: true,
	logger: {
		error(code, metadata) {
			console.error("[NEXTAUTH ERROR]", code, metadata);
		},
		warn(code) {
			console.warn("[NEXTAUTH WARN]", code);
		},
		debug(code, metadata) {
			console.debug("[NEXTAUTH DEBUG]", code, metadata);
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
