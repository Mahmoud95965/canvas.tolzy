import { NextResponse } from 'next/server';

export async function GET() {
  const payload = {
    firebase: {
      apiKeyPresent: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
      appIdPresent: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    },
    app: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || null,
      nodeEnv: process.env.NODE_ENV || null,
    },
    checks: {
      authDomainLooksLikeFirebase:
        (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').includes('firebaseapp.com') ||
        (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').includes('auth.tolzy.me'),
      appDomainConfigured: Boolean(process.env.NEXT_PUBLIC_APP_DOMAIN),
    },
    note:
      'If auth/unauthorized-domain appears, add your deployment domain in Firebase Console > Authentication > Settings > Authorized domains.',
  };

  return NextResponse.json(payload);
}

