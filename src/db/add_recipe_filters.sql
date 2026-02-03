-- =====================================================
-- AJOUT DES COLONNES POUR FILTRES RECETTES
-- =====================================================

-- 1. Ajouter les nouvelles colonnes
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS prep_time INTEGER, -- Temps en minutes
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
ADD COLUMN IF NOT EXISTS diet_tags TEXT[]; -- Array de tags: 'vegan', 'vegetarien', 'sans_gluten', 'sans_lactose', 'halal', 'keto'

-- 2. Mettre à jour les recettes existantes avec des valeurs par défaut
-- (basé sur les calories et le nombre d'ingrédients)

-- Recettes rapides (< 800 cal, peu d'ingrédients) = facile, 15-20 min
UPDATE public.recipes
SET
    prep_time = 15 + (RANDOM() * 10)::INTEGER,
    difficulty = 'facile'
WHERE calories < 500 AND prep_time IS NULL;

-- Recettes moyennes (500-700 cal) = moyen, 25-40 min
UPDATE public.recipes
SET
    prep_time = 25 + (RANDOM() * 15)::INTEGER,
    difficulty = 'moyen'
WHERE calories BETWEEN 500 AND 700 AND prep_time IS NULL;

-- Recettes élaborées (> 700 cal) = difficile, 40-60 min
UPDATE public.recipes
SET
    prep_time = 40 + (RANDOM() * 20)::INTEGER,
    difficulty = 'difficile'
WHERE calories > 700 AND prep_time IS NULL;

-- Fallback pour les recettes sans calories
UPDATE public.recipes
SET
    prep_time = 30,
    difficulty = 'moyen'
WHERE prep_time IS NULL;

-- 3. Ajouter des diet_tags basés sur le nom et la culture
-- Végétarien/Végan pour les recettes Végé
UPDATE public.recipes
SET diet_tags = ARRAY['vegetarien']
WHERE (culture ILIKE '%végé%' OR name ILIKE '%végé%' OR name ILIKE '%legumes%')
  AND diet_tags IS NULL;

-- Healthy = sans tags particuliers mais healthy
UPDATE public.recipes
SET diet_tags = ARRAY['healthy']
WHERE culture = 'Healthy' AND diet_tags IS NULL;

-- Pour les autres, mettre un tableau vide
UPDATE public.recipes
SET diet_tags = ARRAY[]::TEXT[]
WHERE diet_tags IS NULL;

-- 4. Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON public.recipes(prep_time);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_diet_tags ON public.recipes USING GIN(diet_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_name_search ON public.recipes USING GIN(to_tsvector('french', name));

-- 5. Vérifier le résultat
SELECT id, name, prep_time, difficulty, diet_tags, calories
FROM public.recipes
ORDER BY created_at DESC
LIMIT 10;
