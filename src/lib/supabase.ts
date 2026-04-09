import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.BILLING_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_BILLING_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseServiceKey =
  process.env.BILLING_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'placeholder-key';

// Server-side admin client — bypasses RLS
// ONLY use in API routes and Server Components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
