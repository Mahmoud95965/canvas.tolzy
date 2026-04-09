'use client';

import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type FavoriteButtonProps = {
  itemId: string | number;
  itemType: string;
  initialIsFavorite?: boolean;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FavoriteButton({
  itemId,
  itemType,
  initialIsFavorite = false,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);

  const buttonTitle = useMemo(
    () => (isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'),
    [isFavorite]
  );

  const toggleFavorite = async () => {
    if (isPending) return;

    const nextState = !isFavorite;
    setIsFavorite(nextState); // Optimistic UI
    setIsPending(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError || new Error('User not authenticated');

      const baseQuery = supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .limit(1);

      const { data: existing, error: existingError } = await baseQuery;
      if (existingError) throw existingError;

      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing[0].id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase.from('favorites').insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
        });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
      setIsFavorite(!nextState); // rollback on failure
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isPending}
      title={buttonTitle}
      aria-label={buttonTitle}
      className={`group inline-flex items-center justify-center rounded-xl border px-3 py-2 transition-all duration-200 ${
        isFavorite
          ? 'border-red-400/50 bg-red-500/10 text-red-500 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-400'
          : 'border-zinc-200/70 bg-white/70 text-zinc-600 hover:text-red-500 hover:border-red-300/70 hover:bg-red-50/70 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-500/10'
      } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart
        size={18}
        className={`transition-all duration-200 ${
          isFavorite ? 'fill-current scale-105' : 'fill-transparent group-hover:scale-105'
        }`}
      />
    </button>
  );
}

