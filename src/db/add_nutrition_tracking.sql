-- =====================================================
-- SUIVI CALORIES - TABLE DE TRACKING NUTRITIONNEL
-- =====================================================

-- 1. Créer la table de suivi journalier
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Valeurs nutritionnelles du jour
    calories_consumed INTEGER DEFAULT 0,
    calories_goal INTEGER DEFAULT 2000,
    protein_consumed INTEGER DEFAULT 0,
    protein_goal INTEGER DEFAULT 100,
    carbs_consumed INTEGER DEFAULT 0,
    carbs_goal INTEGER DEFAULT 250,
    fat_consumed INTEGER DEFAULT 0,
    fat_goal INTEGER DEFAULT 65,

    -- Repas enregistrés (références aux recettes)
    meals_logged JSONB DEFAULT '[]'::JSONB,

    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Une seule entrée par jour par utilisateur
    UNIQUE(user_id, date)
);

-- 2. Créer la table des objectifs utilisateur
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Objectifs quotidiens
    daily_calories INTEGER DEFAULT 2000,
    daily_protein INTEGER DEFAULT 100,
    daily_carbs INTEGER DEFAULT 250,
    daily_fat INTEGER DEFAULT 65,

    -- Objectif de poids (optionnel)
    target_weight DECIMAL(5,2),
    current_weight DECIMAL(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON public.nutrition_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);

-- 4. Politique RLS pour nutrition_logs
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Users can view their own nutrition logs"
    ON public.nutrition_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Users can insert their own nutrition logs"
    ON public.nutrition_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own nutrition logs" ON public.nutrition_logs;
CREATE POLICY "Users can update their own nutrition logs"
    ON public.nutrition_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Politique RLS pour user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Users can view their own goals"
    ON public.user_goals FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
CREATE POLICY "Users can insert their own goals"
    ON public.user_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
CREATE POLICY "Users can update their own goals"
    ON public.user_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. Fonction pour calculer le streak (jours consécutifs)
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    log_exists BOOLEAN;
BEGIN
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM public.nutrition_logs
            WHERE user_id = p_user_id
            AND date = check_date
            AND calories_consumed > 0
        ) INTO log_exists;

        IF log_exists THEN
            streak_count := streak_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Vérifier la création
SELECT 'Tables créées avec succès' AS status;
