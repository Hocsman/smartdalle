-- Migration: Add culture preference to profiles + New Recipes
-- Run this in Supabase SQL Editor

-- Add culture column to profiles table (with more options)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS culture text CHECK (culture IN ('africaine', 'antillaise', 'maghrebine', 'francaise', 'classique', 'mix'));

-- =====================================================
-- NOUVELLES RECETTES : MAGHREBINES
-- =====================================================

INSERT INTO public.recipes (name, culture, image_url, price_estimated, calories, protein, carbs, fat, ingredients, instructions)
VALUES 
  (
    'Tajine Poulet Citron Confit', 
    'Maghrébine', 
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=2070&auto=format&fit=crop', 
    4.20, 
    520, 
    42, 
    35, 
    18, 
    '["Cuisses de poulet 200g", "Citron confit", "Olives vertes", "Oignon", "Ras el hanout", "Coriandre fraîche"]',
    '1. Faire dorer le poulet avec les épices. 2. Ajouter oignons, citron confit et olives. 3. Mijoter 45 min à feu doux. 4. Servir avec de la semoule.'
  ),
  (
    'Couscous Royal Light', 
    'Maghrébine', 
    'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=2070&auto=format&fit=crop', 
    5.50, 
    680, 
    48, 
    70, 
    20, 
    '["Semoule complète 150g", "Blanc de poulet", "Merguez (1)", "Courgette", "Carotte", "Pois chiches", "Bouillon léger"]',
    '1. Préparer le bouillon avec légumes. 2. Cuire viandes séparément. 3. Cuire semoule à la vapeur. 4. Assembler avec harissa à côté.'
  ),
  (
    'Brick au Thon Fit', 
    'Maghrébine', 
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=1964&auto=format&fit=crop', 
    2.80, 
    380, 
    28, 
    30, 
    15, 
    '["Feuilles de brick (2)", "Thon au naturel", "Oeuf", "Persil", "Oignon", "Câpres"]',
    '1. Mélanger thon, oeuf cru, persil, oignon. 2. Plier en triangle. 3. Cuire au four 180°C (moins gras que frit).'
  ),
  (
    'Shakshuka Protéinée', 
    'Maghrébine', 
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop', 
    3.00, 
    420, 
    25, 
    20, 
    28, 
    '["Oeufs (3)", "Tomates concassées", "Poivron rouge", "Oignon", "Cumin", "Paprika", "Feta (30g)"]',
    '1. Faire revenir poivron et oignon. 2. Ajouter tomates et épices. 3. Creuser des trous, casser les oeufs. 4. Couvrir et cuire.'
  ),
  (
    'Salade Marocaine Express', 
    'Maghrébine', 
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop', 
    2.50, 
    280, 
    8, 
    25, 
    18, 
    '["Tomates", "Concombre", "Poivron", "Oignon rouge", "Huile d''olive", "Cumin", "Citron"]',
    '1. Couper tous les légumes en petits dés. 2. Assaisonner avec huile, citron, cumin, sel.'
  );

-- =====================================================
-- NOUVELLES RECETTES : FRANÇAISES
-- =====================================================

INSERT INTO public.recipes (name, culture, image_url, price_estimated, calories, protein, carbs, fat, ingredients, instructions)
VALUES 
  (
    'Poulet Rôti Pommes de Terre', 
    'Française', 
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=2076&auto=format&fit=crop', 
    4.80, 
    620, 
    45, 
    40, 
    28, 
    '["Cuisse de poulet", "Pommes de terre grenaille", "Thym", "Romarin", "Ail", "Huile d''olive"]',
    '1. Assaisonner le poulet avec herbes. 2. Disposer avec pommes de terre. 3. Four 200°C pendant 45 min.'
  ),
  (
    'Quiche Lorraine Allégée', 
    'Française', 
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2065&auto=format&fit=crop', 
    3.50, 
    380, 
    18, 
    25, 
    24, 
    '["Pâte brisée", "Lardons fumés", "Oeufs (2)", "Crème légère 15%", "Gruyère râpé", "Muscade"]',
    '1. Foncer le moule. 2. Faire revenir lardons. 3. Mélanger oeufs + crème. 4. Cuire 35 min à 180°C.'
  ),
  (
    'Boeuf Bourguignon Express', 
    'Française', 
    'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=2070&auto=format&fit=crop', 
    5.50, 
    580, 
    42, 
    30, 
    28, 
    '["Boeuf à braiser 200g", "Carottes", "Champignons", "Lardons", "Vin rouge", "Bouquet garni"]',
    '1. Faire revenir boeuf et lardons. 2. Ajouter légumes. 3. Mouiller au vin. 4. Mijoter 1h30.'
  ),
  (
    'Croque-Monsieur Protéiné', 
    'Française', 
    'https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=2054&auto=format&fit=crop', 
    2.80, 
    450, 
    32, 
    35, 
    22, 
    '["Pain de mie complet", "Jambon blanc (2 tranches)", "Gruyère râpé", "Béchamel légère"]',
    '1. Tartiner pain de béchamel. 2. Ajouter jambon et fromage. 3. Gratiner au four 10 min.'
  ),
  (
    'Blanquette de Poulet Light', 
    'Française', 
    'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop', 
    4.00, 
    480, 
    38, 
    35, 
    18, 
    '["Escalope de poulet", "Carottes", "Champignons", "Crème légère", "Bouillon", "Persil"]',
    '1. Pocher le poulet dans bouillon. 2. Cuire légumes. 3. Lier avec crème légère. 4. Servir avec riz.'
  ),
  (
    'Salade Niçoise Fit', 
    'Française', 
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2187&auto=format&fit=crop', 
    4.20, 
    420, 
    35, 
    20, 
    25, 
    '["Thon au naturel", "Oeufs durs (2)", "Haricots verts", "Tomates", "Olives noires", "Anchois"]',
    '1. Cuire haricots verts et oeufs. 2. Disposer sur lit de salade. 3. Assaisonner vinaigrette légère.'
  );
