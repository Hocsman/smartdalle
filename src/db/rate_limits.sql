-- ===========================================
-- RATE LIMITS TABLE
-- ===========================================
-- Run this in Supabase SQL Editor

-- Table de tracking des requêtes AI
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,  -- 'recipe_generation', 'image_generation', 'anti_waste'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour lookups rapides
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_time
ON rate_limits(user_id, action_type, created_at DESC);

-- RLS: users can only see their own rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
ON rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
ON rate_limits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Cleanup function (run via Supabase scheduled function or cron)
-- Supprime les entrées de plus de 24h
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
