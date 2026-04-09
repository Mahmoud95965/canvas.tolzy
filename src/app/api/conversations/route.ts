import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return null;
  try {
    const decoded = await adminAuth!.verifyIdToken(token);
    return decoded.uid;
  } catch { return null; }
}

// GET /api/conversations — list user's conversations
export async function GET(req: NextRequest) {
  const userId = await verifyAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/conversations — create new conversation
export async function POST(req: NextRequest) {
  const userId = await verifyAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: userId, title: title || 'New Chat' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
