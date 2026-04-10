import { NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/lib/gemini-service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { FIREBASE_INIT_ERROR } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      },
      services: {
        gemini: {
          configured: isGeminiConfigured(),
          apiKey: process.env.GOOGLE_API_KEY ? '✓ SET' : '❌ NOT SET',
        },
        openrouter: {
          configured: !!process.env.OPENROUTER_API_KEY,
          apiKey: process.env.OPENROUTER_API_KEY ? '✓ SET' : '❌ NOT SET',
          chatModel: process.env.OPENROUTER_CHAT_MODEL || 'DEFAULT',
        },
        firebase: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
          initialized: !FIREBASE_INIT_ERROR,
          error: FIREBASE_INIT_ERROR,
        },
        supabase: {
          configured: isSupabaseConfigured(),
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ SET' : '❌ NOT SET',
          key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ SET' : '❌ NOT SET',
        },
      },
      recommendation: getRecommendation(),
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function getRecommendation(): string {
  if (!process.env.GOOGLE_API_KEY) {
    return '❌ GOOGLE_API_KEY غير مكون';
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return '❌ OPENROUTER_API_KEY غير مكون';
  }
  if (!isSupabaseConfigured()) {
    return '❌ SUPABASE غير مكون بشكل صحيح';
  }
  return '✅ جميع الخدمات مكونة بشكل صحيح';
}
