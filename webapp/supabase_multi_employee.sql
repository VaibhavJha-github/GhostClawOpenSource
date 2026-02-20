-- Multi-Employee Support: Link subscriptions to specific agents
-- Run AFTER supabase_setup.sql, supabase_update.sql, and supabase_fix.sql

-- Add agent_id column (nullable for legacy subscriptions)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_agent_id ON public.subscriptions(agent_id);
