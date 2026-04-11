'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function PaySuccessPage() {
  const { refreshPlan, getIdToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let mounted = true;
    let tries = 0;
    const maxTries = 6;

    const syncPlan = async () => {
      while (mounted && tries < maxTries) {
        tries += 1;
        await refreshPlan();
        const token = await getIdToken();
        const response = await fetch('/api/billing/entitlements', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const payload = response.ok ? await response.json() : {};
        if (!mounted) return;
        if (payload?.plan === 'pro') break;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (mounted) setIsSyncing(false);
    };

    syncPlan();

    return () => {
      mounted = false;
    };
  }, [refreshPlan, getIdToken]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0b0b0c] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#151518] p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={54} />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">أهلاً بك في النادي، يا بطل Tolzy! 💎</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          تم استلام الدفع بنجاح. نقوم الآن بمزامنة خطتك لتفعيل مزايا Pro فوراً.
        </p>
        {isSyncing && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">جاري تحديث حالة الاشتراك...</p>}
        <div className="flex items-center justify-center gap-3">
          <Link href="/app" className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold">
            الانتقال إلى Copilot
          </Link>
          <Link href="https://www.tolzy.me/pricing" className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-white/20 text-zinc-700 dark:text-zinc-200 font-semibold">
            عرض الخطط
          </Link>
        </div>
      </div>
    </div>
  );
}
