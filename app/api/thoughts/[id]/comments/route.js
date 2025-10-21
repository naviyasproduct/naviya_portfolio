import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('thoughtId', '==', id));
    const commentsSnap = await getDocs(q);
    
    const comments = commentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
    }));

    // Sort by newest first
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
