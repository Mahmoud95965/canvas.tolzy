import { PRO_SERVICE_KEY } from '@/lib/plan';

export type BillingService = {
  key: string;
  name: string;
  description: string;
  priceIdEnv: string;
  mode: 'subscription' | 'payment';
};

export const BILLING_SERVICES: BillingService[] = [
  {
    key: PRO_SERVICE_KEY,
    name: 'Tolzy Pro — شريكك الذكي في النجاح 🚀',
    description: 'خطة احترافية تمنحك كل مزايا Tolzy Pro المتقدمة.',
    priceIdEnv: 'STRIPE_PRICE_TOLZY_PRO',
    mode: 'subscription',
  },
];

export function getBillingServiceByKey(serviceKey: string) {
  return BILLING_SERVICES.find((s) => s.key === serviceKey) || null;
}

export function getBillingServicePriceId(serviceKey: string) {
  const service = getBillingServiceByKey(serviceKey);
  if (!service) return null;
  return process.env[service.priceIdEnv] || null;
}
