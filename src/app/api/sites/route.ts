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

// POST /api/sites — Create a new site
export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, subdomain } = body;

  if (!subdomain) {
    return NextResponse.json(
      { error: 'Subdomain is required' },
      { status: 400 }
    );
  }

  // Handle default site name
  const finalName = name || 'Untitled Site';

  // Validate subdomain format (allow alphanumeric and hyphens)
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
  if (!subdomainRegex.test(subdomain)) {
    return NextResponse.json(
      { error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' },
      { status: 400 }
    );
  }

  // Check for reserved subdomains
  const reserved = ['www', 'app', 'api', 'admin', 'mail', 'blog', 'help', 'support'];
  if (reserved.includes(subdomain)) {
    return NextResponse.json(
      { error: 'This subdomain is reserved' },
      { status: 400 }
    );
  }

  // Check if subdomain already exists
  const { data: existing } = await supabaseAdmin
    .from('sites')
    .select('id')
    .eq('subdomain', subdomain)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'This subdomain is already taken' },
      { status: 409 }
    );
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
