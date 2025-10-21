import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  const isAdminRoute = pathname.startsWith('/thoughts/admin') || 
                       pathname.startsWith('/thoughts/manage') ||
                       pathname.match(/^\/thoughts\/[^/]+\/edit$/);
  
  const isLoginRoute = pathname === '/login';

  if (isAdminRoute && !isLoginRoute) {
    const cookie = request.cookies.get('admin-authenticated');

    if (!cookie || cookie.value !== 'true') {
      // Redirect to login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/thoughts/admin/:path*', '/thoughts/manage', '/thoughts/:id/edit'],
};
