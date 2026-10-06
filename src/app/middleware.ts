import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Read the HttpOnly cookie that our Server Action created
  const token = request.cookies.get('memoir_access_token')?.value;

  const { pathname } = request.nextUrl;

  // 1. Protect Dashboard Routes (Require Token)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // No token found? Bounce them to login instantly.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Prevent Logged-in Users from seeing Auth pages
  if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// The matcher tells Next.js exactly which routes this bouncer should watch
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/'],
};