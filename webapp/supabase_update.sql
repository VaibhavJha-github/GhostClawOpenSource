-- ============================================
-- GHOSTCLAW PRODUCTION UPDATE
-- Run this in Supabase SQL Editor to upgrade schema
-- ============================================

-- 1. Create Anonymous Tallies Table (Popup Data)
CREATE TABLE IF NOT EXISTS public.tallies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- e.g. 'ecommerce', 'saas'
  custom_input TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tallies (Public Insert only)
ALTER TABLE public.tallies ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public can insert tallies" ON public.tallies;
    CREATE POLICY "Public can insert tallies" ON public.tallies FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins view tallies" ON public.tallies;
    CREATE POLICY "Admins view tallies" ON public.tallies FOR SELECT USING (false);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Update Referrals for Percentage Rewards
-- We are moving from fixed $50 to 25% off.
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS reward_value INTEGER DEFAULT 25, -- 25%
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT TRUE;

-- Optional: Drop old columns if you want a clean slate (Commented out for safety)
-- ALTER TABLE public.referrals DROP COLUMN referrer_reward_usd;
-- ALTER TABLE public.referrals DROP COLUMN referred_discount_usd;

-- 3. Enhance Agents Table for EC2 Management & Metrics
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS instance_type TEXT DEFAULT 't2.micro',
ADD COLUMN IF NOT EXISTS launch_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'us-east-1',
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS memory_used_mb INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpu_usage_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ;

-- 4. Create Audit Log for "Dangerous" Actions (Terminate/Reboot)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'terminate_instance', 'reboot_instance'
  target_id TEXT, -- instance_id
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users view own audit logs" ON public.audit_logs;
    CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 5. Agent Real-Time Activities Log (for Dashboard "Live Activity")
CREATE TABLE IF NOT EXISTS public.agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'info', 'error', 'task', 'message'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users view own agent activities" ON public.agent_activities;
    CREATE POLICY "Users view own agent activities" ON public.agent_activities 
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.agents 
          WHERE agents.id = agent_activities.agent_id 
          AND agents.user_id = auth.uid()
        )
      );
EXCEPTION
    WHEN undefined_object THEN null;
END $$;



-- DONE
