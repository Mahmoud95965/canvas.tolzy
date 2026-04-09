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

// GET /api/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await verifyAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/conversations/[id]/messages — save a message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await verifyAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { role, content } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({ conversation_id: params.id, role, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Touch conversation updated_at
  await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json(data);
}

// DELETE /api/conversations/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await verifyAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
