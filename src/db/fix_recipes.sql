-- =====================================================
-- FIX RECIPES: Supprimer recette IA + Ajouter images manquantes
-- =====================================================

-- 1. Supprimer la recette générée par IA (Burger Gourmet ou autre)
DELETE FROM public.recipes
WHERE id = '65a84dea-eae1-4712-b272-ec0c3cba3946';

-- 2. Mettre à jour les recettes sans image avec des images Unsplash gratuites
-- (Images génériques de nourriture saine)

-- Pour les recettes de culture "IA" ou sans image
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (culture = 'IA' OR culture IS NULL)
  AND name ILIKE '%bowl%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND name ILIKE '%salade%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%poulet%' OR name ILIKE '%chicken%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%curry%' OR name ILIKE '%dahl%' OR name ILIKE '%lentilles%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1980&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%pancake%' OR name ILIKE '%crêpe%' OR name ILIKE '%petit-déjeuner%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%steak%' OR name ILIKE '%viande%' OR name ILIKE '%boeuf%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%pâtes%' OR name ILIKE '%pasta%' OR name ILIKE '%spaghetti%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=2058&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%riz%' OR name ILIKE '%rice%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%pizza%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%burger%' OR name ILIKE '%sandwich%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%soupe%' OR name ILIKE '%soup%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1974&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%wrap%' OR name ILIKE '%tacos%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1482049016gy643-1ks7cs3e1e7a?q=80&w=2070&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%poisson%' OR name ILIKE '%fish%' OR name ILIKE '%saumon%' OR name ILIKE '%thon%');

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1974&auto=format&fit=crop'
WHERE image_url IS NULL
  AND (name ILIKE '%oeuf%' OR name ILIKE '%omelette%' OR name ILIKE '%egg%');

-- Image par défaut pour toutes les recettes restantes sans image
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop'
WHERE image_url IS NULL;

-- =====================================================
-- FIX SPÉCIFIQUE: Recettes avec images manquantes
-- =====================================================
-- Ces 3 recettes ont été identifiées comme ayant des images manquantes

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop'
WHERE id = '06e6d53f-319a-441e-a539-bd259358a928';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop'
WHERE id = '6d7c2c24-b30a-4d45-a6c8-d2f1a23e8785';

-- Couscous light - image de couscous/semoule avec légumes
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=2070&auto=format&fit=crop'
WHERE id = 'e7b931ce-6596-40e4-bb33-1c0133ea2f9e';

-- Vérifier le résultat
SELECT id, name, culture, image_url FROM public.recipes ORDER BY created_at DESC;
