-- ============================================================
-- Tolzy AI: Conversations Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: users can only access their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed since we use service_role key server-side (bypasses RLS)

-- ============================================================
-- Tolzy AI: User Limits Schema (Model tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_limits (
  user_id TEXT PRIMARY KEY,
  thinker_count INTEGER DEFAULT 0,
  pro_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);

CREATE TRIGGER update_user_limits_updated_at
  BEFORE UPDATE ON user_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Shared Chats (Public read-only view)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  share_slug VARCHAR(21) NOT NULL UNIQUE,
  original_chat_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_chats_slug ON shared_chats(share_slug);
CREATE INDEX IF NOT EXISTS idx_shared_chats_created_at ON shared_chats(created_at DESC);

ALTER TABLE shared_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to shared chats" ON shared_chats;
CREATE POLICY "Allow public read access to shared chats"
ON shared_chats FOR SELECT USING (true);

-- ============================================================
-- Message feedback (Like/Dislike)
-- ============================================================
CREATE TABLE IF NOT EXISTS message_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_feedback_message_id ON message_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_user_id ON message_feedback(user_id);

CREATE TRIGGER update_message_feedback_updated_at
  BEFORE UPDATE ON message_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Billing subscriptions (Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_key TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_id ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_customer_id ON billing_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_subscription_id ON billing_subscriptions(stripe_subscription_id);

CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Service entitlements (multi-service payment gateway)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_entitlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_service_entitlements_user_id ON service_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_service_entitlements_service_key ON service_entitlements(service_key);
CREATE INDEX IF NOT EXISTS idx_service_entitlements_status ON service_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_service_entitlements_subscription_id ON service_entitlements(stripe_subscription_id);

CREATE TRIGGER update_service_entitlements_updated_at
  BEFORE UPDATE ON service_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
