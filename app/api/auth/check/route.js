import { NextResponse } from 'next/server';

export async function GET(req) {
  const isAdmin = req.cookies.get('isAdmin')?.value === '1';
  return NextResponse.json({ isAdmin });
}
