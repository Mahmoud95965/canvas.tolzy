-- Gemini Attempts Tracking Table
-- لتتبع محاولات المستخدمين في استخدام Gemini (محدود للـ Free users إلى 5 محاولات يومية)

CREATE TABLE IF NOT EXISTS gemini_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Indexes للبحث السريع
  CONSTRAINT gemini_attempts_user_id_created_at_idx 
    UNIQUE (user_id, created_at)
) PARTITION BY RANGE (created_at);

-- Index على user_id و created_at للبحث السريع
CREATE INDEX IF NOT EXISTS idx_gemini_attempts_user_id_date
  ON gemini_attempts(user_id, created_at DESC);

-- RLS (Row Level Security) إذا كان مفعل
ALTER TABLE gemini_attempts ENABLE ROW LEVEL SECURITY;

-- Policy للسماح للفقط بالقراءة والكتابة للمستخدم نفسه
CREATE POLICY "Users can only view their own attempts"
  ON gemini_attempts
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own attempts"
  ON gemini_attempts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Comment على الجدول
COMMENT ON TABLE gemini_attempts IS 'تتبع محاولات استخدام Gemini. Free users مقيدون بـ 5 محاولات يومية.';
COMMENT ON COLUMN gemini_attempts.user_id IS 'Firebase user ID';
COMMENT ON COLUMN gemini_attempts.created_at IS 'وقت المحاولة';
