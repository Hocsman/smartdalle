-- ===========================================
-- TABLE: pantry_items (Garde-manger / Mon Frigo)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.pantry_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity TEXT,
    category TEXT NOT NULL DEFAULT 'Autres',
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les requêtes utilisateur
CREATE INDEX IF NOT EXISTS pantry_items_user_id_idx ON public.pantry_items(user_id);
CREATE INDEX IF NOT EXISTS pantry_items_expiry_date_idx ON public.pantry_items(expiry_date);

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pantry items"
    ON public.pantry_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
    ON public.pantry_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
    ON public.pantry_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
    ON public.pantry_items FOR DELETE
    USING (auth.uid() = user_id);
