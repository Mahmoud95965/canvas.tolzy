import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chatId, title, currentMessages } = await request.json();
    if (!chatId || !Array.isArray(currentMessages) || currentMessages.length === 0) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id')
      .eq('id', chatId)
      .single();

    if (convError || !conv || conv.user_id !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const shareSlug = `tzy_${nanoid(10)}`;
    const cleanMessages = currentMessages.map((msg: any) => ({
      role: msg?.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg?.content || ''),
    }));

    const { data, error } = await supabaseAdmin
      .from('shared_chats')
      .insert({
        share_slug: shareSlug,
        original_chat_id: chatId,
        title: title || 'محادثة Tolzy AI',
        messages: cleanMessages,
      })
      .select('share_slug')
      .single();

    if (error) throw error;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${appUrl.replace(/\/$/, '')}/share/${data.share_slug}`;

    return NextResponse.json({ success: true, shareUrl, shareSlug: data.share_slug });
  } catch (error: any) {
    console.error('Share Error:', error);
    return NextResponse.json({ error: 'Failed to share chat' }, { status: 500 });
  }
}
