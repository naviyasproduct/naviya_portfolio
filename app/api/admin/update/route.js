import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(req) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin-authenticated')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, title, content, additionalMedia } = body;

    if (!id) {
      return NextResponse.json({ error: 'missing id' }, { status: 400 });
    }

    // Update the thought in Firestore
    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (additionalMedia !== undefined) updateData.additionalMedia = additionalMedia;

    await adminDb.collection('thoughts').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin update error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
