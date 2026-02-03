-- =====================================================
-- PUSH NOTIFICATIONS - SUBSCRIPTIONS TABLE
-- =====================================================

-- 1. Table pour stocker les abonnements push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Données de l'abonnement Web Push
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,  -- Clé publique
    auth TEXT NOT NULL,     -- Secret d'authentification

    -- Préférences de notifications
    notify_meals BOOLEAN DEFAULT true,
    notify_streak BOOLEAN DEFAULT true,
    notify_weekly_report BOOLEAN DEFAULT false,

    -- Horaires de rappel (format HH:MM)
    breakfast_time TIME DEFAULT '08:00',
    lunch_time TIME DEFAULT '12:30',
    dinner_time TIME DEFAULT '19:30',
    snack_time TIME DEFAULT '16:00',

    -- Métadonnées
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Un seul abonnement par endpoint par utilisateur
    UNIQUE(user_id, endpoint)
);

-- 2. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.push_subscriptions(endpoint);

-- 3. Politiques RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.push_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own subscriptions"
    ON public.push_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update own subscriptions"
    ON public.push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own subscriptions"
    ON public.push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Vérification
SELECT 'Table push_subscriptions créée avec succès' AS status;
