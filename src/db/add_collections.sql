-- =====================================================
-- COLLECTIONS FAVORIS - DOSSIERS PERSONNALISÉS
-- =====================================================

-- 1. Table des collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '📁',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 2. Table de liaison collections <-> recettes
CREATE TABLE IF NOT EXISTS public.collection_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, recipe_id)
);

-- 3. Index
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_collection ON public.collection_recipes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_recipe ON public.collection_recipes(recipe_id);

-- 4. RLS pour collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own collections" ON public.collections;
CREATE POLICY "Users can view own collections"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own collections" ON public.collections;
CREATE POLICY "Users can create own collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
CREATE POLICY "Users can update own collections"
    ON public.collections FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;
CREATE POLICY "Users can delete own collections"
    ON public.collections FOR DELETE
    USING (auth.uid() = user_id);

-- 5. RLS pour collection_recipes (via collection ownership)
ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own collection recipes" ON public.collection_recipes;
CREATE POLICY "Users can view own collection recipes"
    ON public.collection_recipes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_recipes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can add to own collections" ON public.collection_recipes;
CREATE POLICY "Users can add to own collections"
    ON public.collection_recipes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_recipes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can remove from own collections" ON public.collection_recipes;
CREATE POLICY "Users can remove from own collections"
    ON public.collection_recipes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_recipes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- 6. Vérification
SELECT 'Tables collections créées avec succès' AS status;
