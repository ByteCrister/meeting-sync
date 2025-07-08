import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './utils/server/verifyToken';

const PUBLIC_ROUTES = [
    '/user-authentication/error',
    '/user-authentication',
    '/meeting-sync'
];

const PUBLIC_API_ROUTES = [
    '/api/auth/user/auth-forgot-password',
    '/api/auth/user/auth-signup',
    '/api/auth/user/forgot-password',
    '/api/auth/user/signin',
    '/api/auth/user/signup',
    '/api/auth/user/user-otp',
    '/api/auth/user/validity',
    '/api/auth/user/location',

    '/api/auth/custom-google-callback',
    '/api/auth/callback/google',
    '/api/auth/callback/credentials',
    '/api/auth/signin/google',
    '/api/auth/providers',
    '/api/auth/set-cookie',
    '/api/auth/error',
    '/api/auth/csrf',
    '/api/auth/user/validity',
];

const ALWAYS_ALLOWED_AUTH_ROUTES = [
    '/api/auth/user/signup',
    '/api/auth/user/validity',
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

    // 1. Verify token
    let isAuthenticated = false;
    const token = request.cookies.get(process.env.NEXT_TOKEN!)?.value || '';
    if (token) {
        try {
            const payload = await verifyToken(token);
            isAuthenticated = !!payload;
        } catch {
            isAuthenticated = false;
        }
    }

    // 2. Always allow our own /api/auth/* handlers
    if (pathname.startsWith('/api/auth/')) {
        return NextResponse.next();
    }

    // 3. Block authenticated users from hitting public auth APIs
    if (
        isAuthenticated &&
        isApi &&
        isPublicApiRoute &&
        !ALWAYS_ALLOWED_AUTH_ROUTES.includes(pathname)
    ) {
        return NextResponse.json(
            { message: 'Already authenticated. Access denied.' },
            { status: 403 }
        );
    }

    // 4. Block unauthenticated users from protected APIs
    if (!isAuthenticated && isApi && !isPublicApiRoute) {
        return NextResponse.json(
            { message: 'Unauthorized access to API route' },
            { status: 401 }
        );
    }

    // 5. Block unauthenticated users from protected *pages*
    if (!isAuthenticated && !isApi && !isPublicPage) {
        return NextResponse.redirect(
            new URL('/user-authentication', request.url)
        );
    }

    // 6. Redirect authenticated users away from our PUBLIC_ROUTES
    if (isAuthenticated && !isApi && isPublicPage) {
        // If we were sent here with a ?redirect=… param, go back there.
        // Otherwise, send to home (/).
        const target = request.nextUrl.searchParams.get('redirect') || '/';
        return NextResponse.redirect(new URL(target, request.url));
    }

    // 7. Allow everything else
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
};