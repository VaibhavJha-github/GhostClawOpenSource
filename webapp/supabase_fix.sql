-- ============================================
-- GHOSTCLAW SCHEMA FIX MIGRATION
-- Run this in Supabase SQL Editor AFTER setup + update scripts
-- ============================================

-- 1. Fix agents status CHECK constraint
-- The current constraint only allows: deploying, online, offline, error, terminated
-- But EC2 reports states like: running, stopped, pending, stopping, starting
-- Our code also sets: stopping
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_status_check;
ALTER TABLE public.agents ADD CONSTRAINT agents_status_check
  CHECK (status IN (
    'deploying', 'online', 'offline', 'error', 'terminated',
    'running', 'stopped', 'pending', 'stopping', 'starting'
  ));

-- 2. Add missing API key columns for additional providers
-- The Configuration tab lets users save keys for these providers
-- but the columns don't exist in the setup SQL
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS elevenlabs_api_key TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS xai_api_key TEXT;

-- 3. Add use_case column (stores business type selections)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS use_case TEXT;

-- 4. Add index on agent_activities for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_created
  ON public.agent_activities(agent_id, created_at DESC);

-- 5. Verify agent_activities table exists (from supabase_update.sql)
-- If you haven't run supabase_update.sql, this creates it:
CREATE TABLE IF NOT EXISTS public.agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
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

-- ============================================
-- DONE! Run this after supabase_setup.sql + supabase_update.sql
-- ============================================
