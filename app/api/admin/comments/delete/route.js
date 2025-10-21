import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '../../../../../lib/firebaseAdmin';

export async function POST(req) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin-authenticated')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { thoughtId, commentId } = body;

    if (!thoughtId || !commentId) {
      return NextResponse.json({ error: 'missing thoughtId or commentId' }, { status: 400 });
    }

    // Delete the comment from Firestore
    await adminDb
      .collection('thoughts')
      .doc(thoughtId)
      .collection('comments')
      .doc(commentId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('comment delete error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
