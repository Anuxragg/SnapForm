import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('snapform_session');
  const hasSession = Boolean(sessionCookie && sessionCookie.value);

  // 1. Protected routes: require an active session cookie
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/builder');

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth/guest-only routes: redirect logged-in users directly to dashboard
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, svgs, etc.)
     * - api routes (handled directly by Route Handlers)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
