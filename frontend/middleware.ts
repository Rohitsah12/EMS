import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get cookies
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  
  const isAuthenticated = !!(accessToken || refreshToken);

  // Public routes (accessible without authentication)
  const isPublicRoute = pathname === '/login' || pathname === '/';

  // Protected routes (require authentication)
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/employees') || 
                          pathname.startsWith('/departments') || 
                          pathname.startsWith('/leave');

  // If authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // Optionally add the original URL as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};