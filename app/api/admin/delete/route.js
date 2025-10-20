import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(req) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('isAdmin')?.value === '1';
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, mediaUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'missing id' }, { status: 400 });
    }

    // Delete from Firestore using Admin SDK
    await adminDb.collection('thoughts').doc(id).delete();

    // Optionally delete Cloudinary media if present
    if (mediaUrl) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/cloudinary/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mediaUrl })
        });
      } catch (cloudinaryErr) {
        console.warn('Cloudinary delete failed (non-fatal):', cloudinaryErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin delete error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
