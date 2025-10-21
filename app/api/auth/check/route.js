import { NextResponse } from 'next/server';

export async function GET(req) {
  const isAdmin = req.cookies.get('admin-authenticated')?.value === 'true';
  return NextResponse.json({ isAdmin });
}
