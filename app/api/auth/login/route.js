import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) {
    return NextResponse.json({ message: 'Server not configured' }, { status: 500 });
  }
  if (password === admin) {
    const res = NextResponse.json({ ok: true });
    // set a simple cookie (HttpOnly)
    res.cookies.set('isAdmin', '1', { httpOnly: true, path: '/' });
    return res;
  }
  return NextResponse.json({ message: 'Invalid' }, { status: 401 });
}
