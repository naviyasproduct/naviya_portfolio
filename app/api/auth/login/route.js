import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) {
    return NextResponse.json({ message: 'Server not configured' }, { status: 500 });
  }
  if (password === admin) {
    const res = NextResponse.json({ ok: true });
    // set a simple cookie (HttpOnly) - using new auth system cookie name
    res.cookies.set('admin-authenticated', 'true', { 
      httpOnly: true, 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }
  return NextResponse.json({ message: 'Invalid' }, { status: 401 });
}
