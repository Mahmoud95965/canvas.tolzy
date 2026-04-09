'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, plan } = useAuth();
  const isPro = plan === 'pro';

  return (
    <main className="min-h-screen bg-zinc-100 dark:bg-[#0b0b0c] px-4 py-10" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">الملف الشخصي</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">إدارة بياناتك وخطة اشتراكك الحالية.</p>

        <div className="rounded-xl border border-zinc-200 dark:border-white/10 px-4 py-3 mb-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">البريد الإلكتروني</p>
          <p className="font-semibold text-zinc-900 dark:text-white">{user?.email || 'غير متوفر'}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/10 px-4 py-3 mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">الخطة الحالية</p>
          <p className="font-semibold text-zinc-900 dark:text-white">{isPro ? 'PRO' : 'FREE'}</p>
        </div>

        {isPro ? (
          <div className="w-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3 text-sm font-semibold">
            اشتراك Pro مفعل على حسابك.
          </div>
        ) : (
          <Link
            href="/pricing"
            className="w-full inline-flex items-center justify-center bg-black text-white rounded-xl py-3 font-bold hover:opacity-90 transition"
          >
            رفع الخطة إلى Pro
          </Link>
        )}
      </div>
    </main>
  );
}
