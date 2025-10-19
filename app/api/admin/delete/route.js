import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(req) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('isAdmin')?.value === '1';
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!admin.apps?.length) {
    return NextResponse.json({ error: 'server-misconfigured: admin SDK not initialized' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, mediaUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'missing id' }, { status: 400 });
    }

    // Delete Cloudinary media if present
    if (mediaUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = mediaUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Call the cloudinary delete endpoint
        await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/cloudinary/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mediaUrl })
        });
      } catch (cloudinaryErr) {
        console.warn('Cloudinary delete failed (non-fatal):', cloudinaryErr);
        // Continue with Firestore delete even if Cloudinary fails
      }
    }

    // Delete from Firestore using Admin SDK
    const db = admin.firestore();
    await db.collection('thoughts').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin delete error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
