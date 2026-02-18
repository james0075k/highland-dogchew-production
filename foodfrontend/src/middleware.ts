import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token');
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /home to root
  if (pathname === '/home') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/home'],
};
