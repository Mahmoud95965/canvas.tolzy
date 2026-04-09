import { headers } from 'next/headers';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePlan, PRO_SERVICE_KEY } from '@/lib/plan';

export const dynamic = 'force-dynamic';

function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(secret, { apiVersion: '2025-08-27.basil' });
}

async function upsertSubscription(params: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  priceId?: string | null;
  planKey?: string | null;
  status?: string | null;
  currentPeriodEnd?: number | null;
}) {
  const {
    userId,
    customerId,
    subscriptionId,
    priceId,
    planKey,
    status,
    currentPeriodEnd,
  } = params;

  if (!userId && !customerId && !subscriptionId) return;

  let query = supabaseAdmin.from('billing_subscriptions').select('id, user_id').limit(1);
  if (userId) query = query.eq('user_id', userId);
  else if (subscriptionId) query = query.eq('stripe_subscription_id', subscriptionId);
  else if (customerId) query = query.eq('stripe_customer_id', customerId);

  const { data: existing } = await query.maybeSingle();

  const payload: any = {
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    stripe_price_id: priceId || null,
    plan_key: planKey || null,
    status: status || 'inactive',
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
  };

  if (existing?.id) {
    await supabaseAdmin.from('billing_subscriptions').update(payload).eq('id', existing.id);
    return;
  }

  if (!userId) return;
  await supabaseAdmin.from('billing_subscriptions').insert({
    user_id: userId,
    ...payload,
  });
}

async function upsertServiceEntitlement(params: {
  userId?: string | null;
  serviceKey?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  priceId?: string | null;
  status?: string | null;
  currentPeriodEnd?: number | null;
}) {
  const { userId, serviceKey, customerId, subscriptionId, priceId, status, currentPeriodEnd } = params;
  if (!userId || !serviceKey) return;

  await supabaseAdmin.from('service_entitlements').upsert(
    {
      user_id: userId,
      service_key: serviceKey,
      status: status || 'inactive',
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      stripe_price_id: priceId || null,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    },
    { onConflict: 'user_id,service_key' }
  );
}

async function resolveUserId(params: { clientReferenceId?: string | null; metadataUserId?: string | null; email?: string | null }) {
  if (params.clientReferenceId) {
    return params.clientReferenceId;
  }

  if (params.metadataUserId) {
    return params.metadataUserId;
  }

  if (!params.email) {
    return null;
  }

  const { data: byBillingEmail } = await supabaseAdmin
    .from('user_limits')
    .select('user_id')
    .eq('email', params.email)
    .limit(1)
    .maybeSingle();

  if (byBillingEmail?.user_id) {
    return byBillingEmail.user_id;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    const stripe = getStripeClient();
    const body = await req.text();
    const signature = headers().get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadataUserId = session.metadata?.userId || null;
      const clientReferenceId = session.client_reference_id || null;
      const email = session.metadata?.email || session.customer_details?.email || session.customer_email || null;
      const userId = await resolveUserId({ clientReferenceId, metadataUserId, email });
      const serviceKey = session.metadata?.serviceKey || session.metadata?.plan || PRO_SERVICE_KEY;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;

      let priceId: string | null = null;
      let periodEnd: number | null = null;
      let status: string | null = 'active';

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        priceId = sub.items.data[0]?.price?.id || null;
        periodEnd = (sub as any).current_period_end || null;
        status = sub.status || 'active';
      }

      if (!userId) {
        console.error('[stripe-webhook] Missing userId after all fallbacks', {
          eventId: event.id,
          clientReferenceId,
          metadataUserId,
          email,
        });
      } else {
        await upsertSubscription({
          userId,
          customerId,
          subscriptionId,
          priceId,
          planKey: serviceKey,
          status,
          currentPeriodEnd: periodEnd,
        });

        await upsertServiceEntitlement({
          userId,
          serviceKey,
          customerId,
          subscriptionId,
          priceId,
          status,
          currentPeriodEnd: periodEnd,
        });

        const normalizedPlan = normalizePlan(serviceKey);
        await supabaseAdmin.from('user_limits').upsert(
          {
            user_id: userId,
            email,
            plan: normalizedPlan,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        console.info('[stripe-webhook] checkout.session.completed processed', {
          eventId: event.id,
          userId,
          email,
          normalizedPlan,
          serviceKey,
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || null;
      const priceId = sub.items.data[0]?.price?.id || null;
      const status = sub.status || 'inactive';
      const periodEnd = (sub as any).current_period_end || null;

      await upsertSubscription({
        customerId,
        subscriptionId: sub.id,
        priceId,
        status,
        currentPeriodEnd: periodEnd,
      });

      const { data: entitlement } = await supabaseAdmin
        .from('service_entitlements')
        .select('user_id, service_key')
        .eq('stripe_subscription_id', sub.id)
        .maybeSingle();

      if (entitlement?.user_id && entitlement?.service_key) {
        await upsertServiceEntitlement({
          userId: entitlement.user_id,
          serviceKey: entitlement.service_key,
          customerId,
          subscriptionId: sub.id,
          priceId,
          status,
          currentPeriodEnd: periodEnd,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
