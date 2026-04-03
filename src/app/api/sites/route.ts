import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Helper: verify Firebase ID token from Authorization header
async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split('Bearer ')[1];
  try {
    if (!adminAuth) {
      console.error('Firebase Admin not initialized. Check Env Vars.');
      return null;
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('verifyIdToken failed:', error);
    return null;
  }
}

// GET /api/sites — List all sites for authenticated user
export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('sites')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Check Firebase Env Vars' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, subdomain } = body;
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    const finalName = name || 'Untitled Site';
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({ error: 'Invalid subdomain format' }, { status: 400 });
    }

    const reserved = ['www', 'app', 'api', 'admin', 'mail', 'blog', 'help', 'support', 'ai', 'tolzy'];
    if (reserved.includes(subdomain)) {
      return NextResponse.json({ error: 'Reserved subdomain' }, { status: 400 });
    }

    // Check if subdomain already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: `Database Check Error: ${checkError.message}` }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from('sites')
      .insert({
        user_id: userId,
        name: finalName,
        subdomain,
        meta_title: finalName,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Database Insert Error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (globalError: any) {
    console.error('CRITICAL API ERROR:', globalError);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: globalError.message,
      hint: 'Check if SUPABASE_SERVICE_ROLE_KEY and FIREBASE_PRIVATE_KEY are correct in Vercel.'
    }, { status: 500 });
  }
}
