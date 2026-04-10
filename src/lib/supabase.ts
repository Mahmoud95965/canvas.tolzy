import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.BILLING_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.BILLING_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase not fully configured:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
  });
}

// Server-side admin client — bypasses RLS
// ONLY use in API routes and Server Components
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseServiceKey;
}
