-- ============================================
-- GHOSTCLAW SUPABASE SETUP
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- Order matters due to foreign key dependencies!

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate 8-character referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE DEFAULT generate_referral_code(),
  referred_by UUID REFERENCES public.users(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  selected_model TEXT DEFAULT 'anthropic/claude-sonnet-4-20250514',
  selected_channel TEXT DEFAULT 'telegram',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. AGENTS TABLE (Employees)
-- ============================================
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Atlas',
  personality TEXT,
  traits TEXT[],
  primary_model TEXT DEFAULT 'anthropic/claude-sonnet-4-20250514',
  fallback_models TEXT[] DEFAULT ARRAY['openai/gpt-4o'],
  instance_id TEXT,
  ip_address TEXT,
  gateway_token TEXT,
  gateway_port INTEGER DEFAULT 18789,
  status TEXT DEFAULT 'deploying' CHECK (status IN ('deploying', 'online', 'offline', 'error', 'terminated')),
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  telegram_bot_token TEXT,
  telegram_user_id TEXT,
  discord_token TEXT,
  anthropic_api_key TEXT,
  openai_api_key TEXT,
  messages_count INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  api_cost_usd DECIMAL(10,4) DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ
);

-- ============================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. AGENT SKILLS TABLE
-- ============================================
CREATE TABLE public.agent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_version TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  requires_api_key BOOLEAN DEFAULT FALSE,
  api_key_configured BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, skill_name)
);

-- ============================================
-- 5. ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'task', 'skill', 'error', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. REFERRALS TABLE
-- ============================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired')),
  referrer_reward_usd DECIMAL(10,2) DEFAULT 50.00,
  referred_discount_usd DECIMAL(10,2) DEFAULT 15.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ
);

-- ============================================
-- 7. CREDITS TABLE
-- ============================================
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('signup_bonus', 'monthly_refill', 'referral_bonus', 'purchase', 'usage')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create user profile + signup bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- $15 signup bonus
  INSERT INTO public.credits (user_id, amount, balance_after, source, description)
  VALUES (NEW.id, 15.00, 15.00, 'signup_bonus', 'Welcome bonus - $15 AI credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Users can view own agents" ON public.agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents" ON public.agents FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Agent skills policies
CREATE POLICY "Users can view agent skills" ON public.agent_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_skills.agent_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage agent skills" ON public.agent_skills FOR ALL USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_skills.agent_id AND user_id = auth.uid())
);

-- Activity logs policies
CREATE POLICY "Users can view agent logs" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents WHERE id = activity_logs.agent_id AND user_id = auth.uid())
);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (
  auth.uid() = referrer_id OR auth.uid() = referred_id
);

-- Credits policies
CREATE POLICY "Users can view own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_agent_skills_agent_id ON public.agent_skills(agent_id);
CREATE INDEX idx_activity_logs_agent_id ON public.activity_logs(agent_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_credits_user_id ON public.credits(user_id);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
