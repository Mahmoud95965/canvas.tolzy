import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';
import { getBillingServiceByKey, getBillingServicePriceId } from '@/modules/payment/services';
import { PRO_PRODUCT_ID, PRO_SERVICE_KEY } from '@/lib/plan';

async function verifyAuth(req: NextRequest): Promise<{ uid: string; email?: string | null } | null> {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe key missing' }, { status: 500 });
    }

    const { serviceKey } = await req.json();
    const normalizedServiceKey = serviceKey || PRO_SERVICE_KEY;
    const service = normalizedServiceKey ? getBillingServiceByKey(normalizedServiceKey) : null;
    if (!service) return NextResponse.json({ error: 'Invalid service key' }, { status: 400 });

    const priceId = getBillingServicePriceId(service.key);
    if (!priceId) {
      return NextResponse.json({ error: 'Price id missing for service' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-08-27.basil' });
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const successUrl = `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = 'https://www.tolzy.me/pricing';

    const session = await stripe.checkout.sessions.create({
      mode: service.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: auth.uid,
      customer_email: auth.email || undefined,
      metadata: {
        userId: auth.uid,
        plan: PRO_SERVICE_KEY,
        email: auth.email || '',
        serviceKey: service.key,
        productId: PRO_PRODUCT_ID,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}
