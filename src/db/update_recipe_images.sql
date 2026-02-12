-- ===========================================
-- UPDATE RECIPE IMAGES - Better matching photos
-- ===========================================
-- Run this in Supabase SQL Editor to fix image mismatches
-- All images from Unsplash (free for commercial use)

-- 1. Mafé Allégé (Poulet) - African peanut chicken stew
-- Using: Chicken curry stew with sauce
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800&auto=format&fit=crop'
WHERE name = 'Mafé Allégé (Poulet)';

-- 2. Poulet Yassa Fit - Senegalese chicken with onions
-- Using: Grilled chicken with onions and rice
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop'
WHERE name = 'Poulet Yassa Fit';

-- 3. Bowl Thon Avocat - Tuna poke bowl (keep current - matches well)
-- Using: Healthy poke bowl with vegetables
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop'
WHERE name = 'Bowl Thon Avocat';

-- 4. Omelette Fromage Ciboulette - French cheese omelette
-- Using: Classic folded omelette with herbs
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop'
WHERE name = 'Omelette Fromage Ciboulette';

-- 5. Dahl Lentilles Corail - Indian red lentil dal
-- Using: Orange/red lentil curry in bowl
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop'
WHERE name = 'Dahl Lentilles Corail';

-- 6. Colombo de Porc Express - Creole pork curry
-- Using: Curry with meat and potatoes
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop'
WHERE name = 'Colombo de Porc Express';

-- 7. Pâtes Bolognaise Soja - Vegetarian soy bolognese pasta
-- Using: Spaghetti with tomato sauce
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop'
WHERE name = 'Pâtes Bolognaise Soja';

-- 8. Wrap Poulet Curry - Curry chicken wrap (keep current)
-- Using: Tortilla wrap with chicken filling
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop'
WHERE name = 'Wrap Poulet Curry';

-- 9. Oeufs Brouillés Tomate - Scrambled eggs with tomato
-- Using: Scrambled eggs on plate with vegetables
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=800&auto=format&fit=crop'
WHERE name = 'Oeufs Brouillés Tomate';

-- 10. Salade César "Street" - Caesar salad with chicken
-- Using: Fresh caesar salad with chicken
UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=800&auto=format&fit=crop'
WHERE name = 'Salade César "Street"';

-- ===========================================
-- VERIFY: Check all recipe images
-- ===========================================
SELECT name,
       CASE
         WHEN image_url IS NULL THEN '❌ No image'
         WHEN image_url LIKE '%unsplash%' THEN '✅ Unsplash'
         ELSE '⚠️ Other source'
       END as image_status,
       image_url
FROM public.recipes
ORDER BY name;
