-- ===========================================
-- GAMIFICATION - Badges & Achievements
-- ===========================================
-- Run this in Supabase SQL Editor

-- Table des badges débloqués par utilisateur
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);

-- RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
    ON public.user_badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
