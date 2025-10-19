import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Server-side Firebase Admin SDK write endpoint
// This endpoint expects a POST with JSON: { title, content, mediaUrl, mediaType }
// It verifies the isAdmin cookie (set by /api/auth/login) and writes to Firestore

import admin from 'firebase-admin';
import fs from 'fs';

function initAdminSdk() {
  if (admin.apps?.length) return true;

  // Try JSON in env var first
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    try {
      const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw;
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('Firebase Admin SDK initialized from FIREBASE_SERVICE_ACCOUNT_KEY');
      return true;
    } catch (err) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY parse error:', err);
      // fallthrough to try path
    }
  }

  // Try reading a JSON file path
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (p) {
    try {
      const file = fs.readFileSync(p, 'utf8');
      const serviceAccount = JSON.parse(file);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('Firebase Admin SDK initialized from FIREBASE_SERVICE_ACCOUNT_PATH');
      return true;
    } catch (err) {
      console.error('Error reading/parsing service account file at', p, err);
    }
  }

  // Fallback: try repo-local secrets/service-account.json for convenience (dev only)
  const fallback = './secrets/service-account.json';
  try {
    if (fs.existsSync(fallback)) {
      const file = fs.readFileSync(fallback, 'utf8');
      const serviceAccount = JSON.parse(file);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('Firebase Admin SDK initialized from repo fallback secrets/service-account.json');
      return true;
    }
  } catch (err) {
    console.error('Error reading/parsing fallback service account file', err);
  }

  console.warn('Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH');
  return false;
}

initAdminSdk();

export async function POST(req) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('isAdmin')?.value === '1';
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!admin.apps?.length) {
    console.error('admin SDK not initialized; check FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH');
    return NextResponse.json({ error: 'server-misconfigured: admin SDK not initialized' }, { status: 500 });
  }

  const body = await req.json();
  const { title, content, mediaUrl, mediaType } = body;

  try {
    const db = admin.firestore();
    const docRef = await db.collection('thoughts').add({
      title: title || null,
      content: content || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    console.error('admin create error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
