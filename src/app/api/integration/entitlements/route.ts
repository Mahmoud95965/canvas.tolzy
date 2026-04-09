import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyIntegrationToken } from '@/lib/integration-auth';
import { planFromEntitlements } from '@/lib/plan';

export const dynamic = 'force-dynamic';

type EntitlementRow = {
  service_key: string;
  status: string;
  current_period_end: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '');
    const tokenPayload = verifyIntegrationToken(bearerToken);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
    }

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('service_entitlements')
      .select('service_key,status,current_period_end')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const entitlements = (data || []) as EntitlementRow[];
    const plan = planFromEntitlements(entitlements);

    return NextResponse.json({
      userId,
      plan,
      entitlements,
      source: 'service_entitlements',
      issuedToProject: tokenPayload.projectKey,
    });
  } catch (error: any) {
    console.error('Integration entitlements error:', error);
    return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 });
  }
}

