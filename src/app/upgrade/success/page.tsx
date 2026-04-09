import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0b0b0c] flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141518] p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={56} />
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">تمت الترقية بنجاح</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          شكرا لاشتراكك. يمكنك الآن العودة للتطبيق والاستفادة من مزايا الخطة الجديدة.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold"
        >
          العودة إلى التطبيق
        </Link>
      </div>
    </div>
  );
}
