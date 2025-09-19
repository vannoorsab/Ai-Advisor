import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app: admin.app.App;

try {
  // Try to get service account from environment variable (JSON string)
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    const serviceAccountObj = JSON.parse(serviceAccount);
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountObj),
      projectId: serviceAccountObj.project_id,
      storageBucket: `${serviceAccountObj.project_id}.appspot.com`,
    });
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  throw error;
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();

// Verify Firebase ID token
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Create custom token (if needed)
export async function createCustomToken(uid: string): Promise<string> {
  return await auth.createCustomToken(uid);
}

export default app;
