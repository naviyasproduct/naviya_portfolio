import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const docRef = doc(db, 'thoughts', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Thought not found' },
        { status: 404 }
      );
    }

    const thought = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate().toISOString() : null,
      updatedAt: docSnap.data().updatedAt?.toDate ? docSnap.data().updatedAt.toDate().toISOString() : null,
    };

    return NextResponse.json({ success: true, thought });
  } catch (error) {
    console.error('Error fetching thought:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, blocks } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'thoughts', id);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Thought not found' },
        { status: 404 }
      );
    }

    await updateDoc(docRef, {
      title: title.trim(),
      blocks: blocks || [],
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating thought:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
