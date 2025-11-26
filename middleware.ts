import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/api/auth/login', '/api/auth/register', '/api/seed'];

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If trying to access a public path with a token, redirect to dashboard
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If trying to access a protected path without a token, redirect to login
    if (!isPublicPath && !token && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico') && !pathname.startsWith('/public')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
