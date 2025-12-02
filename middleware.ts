import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is trying to access dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for auth cookie or header
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect from login to dashboard if already authenticated
  if (request.nextUrl.pathname === '/login') {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard/errors', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};

