import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

try {
  if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialize with only projectId for token verification (no admin privileges for other services)
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
      });
    }
  }
} catch (error) {
  console.warn('Firebase Admin initialization skipped during build/server init due to missing env vars.');
}

// Ensure getAuth is safely exported even if init fails during build
export const adminAuth = getApps().length > 0 ? getAuth() : null as unknown as ReturnType<typeof getAuth>;
