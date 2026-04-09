import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messageId, feedbackType } = await req.json();
    if (!messageId || !['like', 'dislike'].includes(feedbackType)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('message_feedback')
      .upsert(
        {
          message_id: messageId,
          user_id: userId,
          feedback_type: feedbackType,
        },
        { onConflict: 'message_id,user_id' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Message feedback error:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
