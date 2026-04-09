export type NormalizedPlan = 'free' | 'pro';

export const PRO_SERVICE_KEY = 'tolzy_pro';
export const PRO_PRODUCT_ID = 'prod_UIsjwFebXdCN9Z';
export const PRO_LAUNCH_GUARD = false;
export const LOCK_PREMIUM_MODELS_DURING_LAUNCH = true;

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

export function planFromPlanRow(row: Record<string, unknown> | null | undefined): NormalizedPlan {
  if (!row) return 'free';

  const booleanProFlags = [row.is_pro, row.pro, row.isPro, row.pro_enabled, row.has_pro, row.is_paid];
  if (booleanProFlags.some((value) => value === true || value === 1 || value === '1' || value === 'true')) {
    return 'pro';
  }

  const candidateValues = [
    row.plan,
    row.plan_name,
    row.tier,
    row.subscription_plan,
    row.package,
    row.type,
    row.level,
    row.current_plan,
    row.subscription_tier,
    row.role,
  ];

  for (const value of candidateValues) {
    const raw = String(value ?? '').toLowerCase().trim();
    if (!raw) continue;
    if (
      raw.includes('pro') ||
      raw.includes('premium') ||
      raw.includes('elite') ||
      raw.includes('paid') ||
      raw.includes('business') ||
      raw.includes('plus')
    ) {
      return 'pro';
    }
  }

  return 'free';
}
