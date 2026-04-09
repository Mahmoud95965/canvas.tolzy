import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';
import { planFromEntitlements } from '@/lib/plan';

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

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('service_entitlements')
      .select('service_key, status, current_period_end')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    const entitlements = data || [];
    const plan = planFromEntitlements(entitlements);
    return NextResponse.json({ entitlements, plan });
  } catch (error: any) {
    console.error('Entitlements error:', error);
    return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 });
  }
}
