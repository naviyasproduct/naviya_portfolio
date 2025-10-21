import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /thoughts/admin route (but not /admin/login)
  if (pathname.startsWith('/thoughts/admin') && !pathname.startsWith('/admin/login')) {
    const cookie = request.cookies.get('admin-authenticated');

    if (!cookie || cookie.value !== 'true') {
      // Redirect to login
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/thoughts/admin/:path*', '/admin/:path*'],
};
