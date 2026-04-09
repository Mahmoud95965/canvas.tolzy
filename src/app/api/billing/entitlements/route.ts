import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase';
import { planFromEntitlements, planFromPlanRow } from '@/lib/plan';

export const dynamic = 'force-dynamic';

type AuthPayload = { uid: string; email: string | null };

async function verifyAuth(req: NextRequest): Promise<AuthPayload | null> {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

async function findPlanRow(auth: AuthPayload): Promise<Record<string, unknown> | null> {
  const tableCandidates = ['plan', 'plans', 'user_plans'];
  const selectors: Array<{ column: string; value: string; mode: 'eq' | 'ilike' }> = [
    { column: 'user_id', value: auth.uid, mode: 'eq' },
    { column: 'uid', value: auth.uid, mode: 'eq' },
    { column: 'userId', value: auth.uid, mode: 'eq' },
  ];

  if (auth.email) {
    selectors.push({ column: 'email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'user_email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email_address', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'mail', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'user_email', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'email_address', value: auth.email, mode: 'ilike' });
    selectors.push({ column: 'mail', value: auth.email, mode: 'ilike' });
  }

  for (const tableName of tableCandidates) {
    for (const selector of selectors) {
      let query = supabaseAdmin.from(tableName).select('*');
      query = selector.mode === 'ilike' ? query.ilike(selector.column, selector.value) : query.eq(selector.column, selector.value);
      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data[0] as Record<string, unknown>;
      }
    }
  }

  return null;
}

function isMissingTableError(error: any): boolean {
  return error?.code === 'PGRST205';
}

async function findUserLimitsRow(auth: AuthPayload): Promise<Record<string, unknown> | null> {
  const selectors: Array<{ column: string; value: string; mode: 'eq' | 'ilike' }> = [
    { column: 'user_id', value: auth.uid, mode: 'eq' },
    { column: 'uid', value: auth.uid, mode: 'eq' },
    { column: 'userId', value: auth.uid, mode: 'eq' },
  ];

  if (auth.email) {
    selectors.push({ column: 'email', value: auth.email, mode: 'eq' });
    selectors.push({ column: 'email', value: auth.email, mode: 'ilike' });
  }

  for (const selector of selectors) {
    let query = supabaseAdmin.from('user_limits').select('*');
    query = selector.mode === 'ilike' ? query.ilike(selector.column, selector.value) : query.eq(selector.column, selector.value);
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1);
    if (!error && Array.isArray(data) && data.length > 0) {
      return data[0] as Record<string, unknown>;
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const planRow = await findPlanRow(auth);
    if (planRow) {
      const plan = planFromPlanRow(planRow);
      return NextResponse.json({ entitlements: [], plan, source: 'plan' });
    }

    const limitsRow = await findUserLimitsRow(auth);
    if (limitsRow) {
      const plan = planFromPlanRow(limitsRow);
      return NextResponse.json({ entitlements: [], plan, source: 'user_limits' });
    }

    const { data, error } = await supabaseAdmin
      .from('service_entitlements')
      .select('service_key, status, current_period_end')
      .eq('user_id', auth.uid)
      .order('updated_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ entitlements: [], plan: 'free', source: 'fallback_no_entitlements_table' });
      }
      throw error;
    }
    const entitlements = data || [];
    const plan = planFromEntitlements(entitlements);
    return NextResponse.json({ entitlements, plan });
  } catch (error: any) {
    console.error('Entitlements error:', error);
    return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 });
  }
}
