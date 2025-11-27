import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/api/auth/login', '/api/auth/register', '/api/seed', '/api/debug'];

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If trying to access a public path with a token
    if (isPublicPath && token) {
        const payload = await verifyToken(token);
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // If trying to access a protected path without a token
    if (!isPublicPath && !token && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico') && !pathname.startsWith('/public')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access a protected path WITH a token, verify it
    if (!isPublicPath && token && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico')) {
        const payload = await verifyToken(token);
        if (!payload) {
            // Invalid token
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
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
