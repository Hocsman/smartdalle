-- ===========================================
-- CHECK FOR DUPLICATE RECIPES
-- ===========================================

-- 1. Find exact duplicate names
SELECT name, COUNT(*) as count
FROM public.recipes
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. List all recipes with their IDs to see duplicates
SELECT id, name, culture, created_at
FROM public.recipes
ORDER BY name, created_at;

-- 3. Find similar names (case insensitive duplicates)
SELECT r1.name as name1, r2.name as name2
FROM public.recipes r1
JOIN public.recipes r2 ON r1.id < r2.id
WHERE LOWER(TRIM(r1.name)) = LOWER(TRIM(r2.name));

-- ===========================================
-- DELETE DUPLICATES (keep oldest entry)
-- Run this ONLY after verifying duplicates above
-- ===========================================

-- DELETE FROM public.recipes
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id,
--                ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
--         FROM public.recipes
--     ) sub
--     WHERE rn > 1
-- );

-- Verify after cleanup
-- SELECT name, COUNT(*) FROM public.recipes GROUP BY name ORDER BY name;
