'use client';

import { useMemo, useState } from 'react';
import { Check, Link as LinkIcon, Share2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type ShareButtonProps = {
  chatId: string | number;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function generateShareId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ShareButton({ chatId }: ShareButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toast, setToast] = useState('');

  const title = useMemo(
    () => (isCopied ? 'تم نسخ الرابط بنجاح!' : 'نسخ رابط المشاركة'),
    [isCopied]
  );

  const handleShare = async () => {
    if (isPending) return;
    setIsPending(true);
    setToast('');

    try {
      const shareId = generateShareId(8);
      const { error } = await supabase
        .from('chats')
        .update({ is_public: true, share_id: shareId })
        .eq('id', chatId);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);

      setIsCopied(true);
      setToast('تم نسخ الرابط بنجاح!');
      setTimeout(() => {
        setIsCopied(false);
        setToast('');
      }, 1800);
    } catch (err) {
      console.error('Share link creation failed:', err);
      setToast('تعذر إنشاء الرابط حالياً');
      setTimeout(() => setToast(''), 1800);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        disabled={isPending}
        title={title}
        aria-label={title}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${
          isCopied
            ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'border-zinc-200/70 bg-white/70 text-zinc-600 hover:border-indigo-300/70 hover:text-indigo-600 hover:bg-indigo-50/70 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10'
        } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isCopied ? (
          <Check size={17} className="transition-transform duration-200 scale-105" />
        ) : (
          <>
            <Share2 size={16} />
            <LinkIcon size={14} className="opacity-70" />
          </>
        )}
      </button>

      {toast && (
        <div className="absolute top-full mt-2 right-0 z-40 rounded-lg border border-white/15 bg-zinc-900 text-white dark:bg-zinc-800 px-3 py-1.5 text-xs shadow-xl whitespace-nowrap animate-in fade-in duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}

