-- Pricing & Subscription update (Free / Pro only)
-- Run once in Supabase SQL editor.

ALTER TABLE user_limits
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

CREATE INDEX IF NOT EXISTS idx_user_limits_email ON user_limits(email);
CREATE INDEX IF NOT EXISTS idx_user_limits_plan ON user_limits(plan);

-- Keep values normalized.
UPDATE user_limits
SET plan = CASE
  WHEN LOWER(COALESCE(plan, '')) LIKE '%pro%' THEN 'pro'
  ELSE 'free'
END;
