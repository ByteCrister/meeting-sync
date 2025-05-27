import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './utils/server/verifyToken';

const PUBLIC_ROUTES = [
    '/user-authentication',
];

const PUBLIC_API_ROUTES = [
    '/api/auth/user/auth-forgot-password',
    '/api/auth/user/auth-signup',
    '/api/auth/user/forgot-password',
    '/api/auth/user/signin',
    '/api/auth/user/signup',
    '/api/auth/user/user-otp',
    '/api/auth/user/validity',
];

const ALWAYS_ALLOWED_AUTH_ROUTES = [
    '/api/auth/user/signup',
    '/api/auth/user/validity'
];

const API_PREFIX = '/api';

function isAuthPage(pathname: string) {
    return PUBLIC_ROUTES.includes(pathname);
}

function isPublicApi(pathname: string) {
    return PUBLIC_API_ROUTES.includes(pathname);
}

function isApiRoute(pathname: string) {
    return pathname.startsWith(API_PREFIX);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isApi = isApiRoute(pathname);
    const isPublicApiRoute = isPublicApi(pathname);
    const isPublicPage = isAuthPage(pathname);

    let isAuthenticated = false;
    const token = request.cookies.get(process.env.NEXT_TOKEN!)?.value || '';

    if (token) {
        try {
            const payload = await verifyToken(token);
            isAuthenticated = !!payload;
        } catch (err) {
            console.warn('[Middleware] Invalid token:', err);
            isAuthenticated = false;
        }
    }

    // 1. Block authenticated users from hitting auth-related public APIs
    if (isAuthenticated
        && isApi
        && isPublicApiRoute
        && !ALWAYS_ALLOWED_AUTH_ROUTES.includes(pathname)
    ) {
        return new NextResponse(
            JSON.stringify({ message: 'Already authenticated. Access denied.' }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // 2. Block unauthenticated users from protected APIs
    if (!isAuthenticated && isApi && !isPublicApiRoute) {
        return new NextResponse(
            JSON.stringify({ message: 'Unauthorized access to API route' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // 3. Block unauthenticated users from protected pages
    if (!isAuthenticated && !isApi && !isPublicPage) {
        return NextResponse.redirect(new URL('/user-authentication', request.url));
    }

    // 4. Redirect authenticated users away from login page
    if (isAuthenticated && !isApi && isPublicPage) {
        const redirectUrl = new URL('/user-authentication', request.url);
        redirectUrl.searchParams.set('redirect', pathname); // capture previous page
        return NextResponse.redirect(redirectUrl);
    }

    if (isAuthenticated && pathname === '/user-authentication') {
        const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';
        return NextResponse.redirect(new URL(redirectTarget, request.url));
    }


    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
};
