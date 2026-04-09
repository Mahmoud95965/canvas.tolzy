export type NormalizedPlan = 'free' | 'pro';

export const PRO_SERVICE_KEY = 'tolzy_pro';
export const PRO_PRODUCT_ID = 'prod_UIsjwFebXdCN9Z';

export function normalizePlan(value: unknown): NormalizedPlan {
  const raw = String(value ?? '').toLowerCase();
  return raw.includes('pro') ? 'pro' : 'free';
}

export function isActiveStatus(status: unknown): boolean {
  const normalized = String(status ?? '').toLowerCase();
  return normalized === 'active' || normalized === 'trialing' || normalized === 'past_due';
}

export function planFromEntitlements(
  entitlements: Array<{ service_key?: unknown; status?: unknown }>
): NormalizedPlan {
  const hasPro = entitlements.some((item) => {
    const serviceKey = String(item?.service_key ?? '');
    return normalizePlan(serviceKey) === 'pro' && isActiveStatus(item?.status);
  });
  return hasPro ? 'pro' : 'free';
}
