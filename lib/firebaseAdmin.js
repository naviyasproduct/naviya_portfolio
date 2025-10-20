import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      // Parse the JSON string
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables');
      throw new Error('Firebase Admin SDK configuration missing');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    throw error;
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
