import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app: admin.app.App | null = null;
let isFirebaseInitialized = false;

try {
  // Check if Firebase is already initialized
  if (!admin.apps || admin.apps.length === 0) {
    // Try to get service account from environment variable (JSON string)
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      const serviceAccountObj = JSON.parse(serviceAccount);
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountObj),
        projectId: serviceAccountObj.project_id,
        storageBucket: `${serviceAccountObj.project_id}.appspot.com`,
      });
      isFirebaseInitialized = true;
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('Firebase Admin not initialized: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Some features may be limited.');
    }
  } else {
    app = admin.apps[0] as admin.app.App;
    isFirebaseInitialized = true;
    console.log('Firebase Admin already initialized');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  console.warn('Continuing without Firebase. Some features may be limited.');
}

// Export Firebase services only if initialized
export const auth = isFirebaseInitialized ? admin.auth() : null;
export const firestore = isFirebaseInitialized ? admin.firestore() : null;
export const storage = isFirebaseInitialized ? admin.storage() : null;

// Export initialization status for other services to check
export { isFirebaseInitialized };

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
