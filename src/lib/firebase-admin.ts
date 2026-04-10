import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let initializationError: string | null = null;

try {
  if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (privateKey && clientEmail && projectId) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else if (projectId) {
      initializeApp({ projectId });
    } else {
      initializationError = 'FIREBASE_PROJECT_ID is required';
    }
  }
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  initializationError = `Firebase initialization failed: ${msg}`;
  console.error(initializationError);
}

export const adminAuth = getApps().length > 0 ? getAuth() : null as unknown as ReturnType<typeof getAuth>;
export const FIREBASE_INIT_ERROR = initializationError;
