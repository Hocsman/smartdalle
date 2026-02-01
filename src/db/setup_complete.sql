-- ACTIVE LES EXTENSIONS NÉCESSAIRES
create extension if not exists "uuid-ossp";

-- 1. TABLE PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  objectif text check (objectif in ('perte_poids', 'maintain', 'prise_masse')),
  budget_level text check (budget_level in ('eco', 'standard', 'confort')),
  calories_target int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active RLS (Row Level Security) pour Profiles
alter table public.profiles enable row level security;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);


-- 2. TABLE RECIPES
create table if not exists public.recipes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  culture text, -- ex: 'Africaine', 'Française', 'Créole'
  image_url text,
  price_estimated numeric, -- Prix estimé pour une portion
  calories int,
  protein int,
  carbs int,
  fat int,
  ingredients jsonb, -- Liste des ingrédients
  instructions text
);

-- Active RLS pour Recipes (Tout le monde peut lire)
alter table public.recipes enable row level security;
create policy "Everything is public" on public.recipes for select using (true);


-- 3. TABLE DAILY_PLANS
create table if not exists public.daily_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  date date not null,
  breakfast_recipe_id uuid references public.recipes(id),
  lunch_recipe_id uuid references public.recipes(id),
  dinner_recipe_id uuid references public.recipes(id),
  snack_recipe_id uuid references public.recipes(id)
);

-- Active RLS pour Daily Plans
alter table public.daily_plans enable row level security;
create policy "Users can view their own plans" on public.daily_plans for select using (auth.uid() = user_id);
create policy "Users can insert their own plans" on public.daily_plans for insert with check (auth.uid() = user_id);

-- 4. TABLE WEIGHT_LOGS (Progress tracking)
create table if not exists public.weight_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  weight decimal not null,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weight_logs enable row level security;

create policy "Users can view their own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);


-- 5. SEED DATA (RECETTES)
INSERT INTO public.recipes (name, culture, image_url, price_estimated, calories, protein, carbs, fat, ingredients, instructions)
VALUES 
  (
    'Mafé Allégé (Poulet)', 
    'Africaine', 
    'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop', 
    4.50, 
    650, 
    45, 
    50, 
    25, 
    '["Escalope de poulet 150g", "Beurre de cacahuète nature 20g", "Concentré de tomate", "Oignon", "Riz complet 100g"]',
    '1. Faire revenir oignons et poulet. 2. Ajouter tomate et eau. 3. Incorporer beurre de cacahuète. 4. Laisser mijoter.'
  ),
  (
    'Poulet Yassa Fit', 
    'Africaine', 
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2013&auto=format&fit=crop', 
    3.80, 
    580, 
    50, 
    60, 
    15, 
    '["Cuisse de poulet (désossée sans peau)", "Oignons (beaucoup)", "Moutarde", "Citron", "Riz 100g"]',
    '1. Mariner poulet (moutarde, citron). 2. Cuire oignons lentement. 3. Assembler et cuire.'
  ),
  (
    'Bowl Thon Avocat', 
    'Healthy', 
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop', 
    4.20, 
    450, 
    35, 
    40, 
    20, 
    '["Thon en boîte (nature)", "Avocat (demi)", "Riz ou Quinoa", "Maïs", "Concombre"]',
    '1. Disposer le riz au fond. 2. Ajouter les toppings. 3. Assaisonner.'
  ),
  (
    'Omelette Fromage Ciboulette', 
    'Française', 
    'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=2069&auto=format&fit=crop', 
    2.50, 
    380, 
    25, 
    5, 
    30, 
    '["Oeufs (3)", "Emmental râpé 30g", "Ciboulette", "Beurre noisette"]',
    '1. Battre les oeufs. 2. Cuire à la poêle. 3. Plier avec fromage.'
  ),
  (
    'Dahl Lentilles Corail', 
    'Indienne', 
    'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=2070&auto=format&fit=crop', 
    2.20, 
    420, 
    22, 
    65, 
    8, 
    '["Lentilles corail 100g", "Lait de coco light", "Curry", "Tomates concassées"]',
    '1. Cuire lentilles dans lait coco + eau + épices. 2. Servir chaud.'
  ),
  (
    'Colombo de Porc Express', 
    'Créole', 
    'https://images.unsplash.com/photo-1626804475297-411f1969e9c7?q=80&w=2070&auto=format&fit=crop', 
    4.00, 
    600, 
    40, 
    55, 
    22, 
    '["Échine de porc maigre", "Poudre de colombo", "Pomme de terre", "Courgette"]',
    '1. Mariner porc. 2. Cuire avec légumes et épices.'
  ),
  (
    'Pâtes Bolognaise Soja', 
    'Végé/Street', 
    'https://images.unsplash.com/photo-1626844131082-256783844137?q=80&w=1935&auto=format&fit=crop', 
    2.80, 
    520, 
    30, 
    80, 
    10, 
    '["Pâtes complètes", "Protéines de soja texturées", "Sauce tomate", "Basilic"]',
    '1. Réhydrater soja. 2. Cuire sauce tomate. 3. Servir sur pâtes.'
  ),
  (
    'Wrap Poulet Curry', 
    'Street', 
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=1964&auto=format&fit=crop', 
    3.50, 
    480, 
    35, 
    45, 
    15, 
    '["Tortilla blé complet", "Aiguillette poulet", "Curry", "Yaourt grec", "Salade"]',
    '1. Cuire poulet curry. 2. Tartiner wrap de yaourt. 3. Rouler.'
  ),
  (
    'Oeufs Brouillés Tomate', 
    'Express', 
    'https://images.unsplash.com/photo-1525351484163-7529414395d8?q=80&w=2070&auto=format&fit=crop', 
    1.90, 
    320, 
    20, 
    8, 
    22, 
    '["Oeufs (3)", "Tomate fraîche", "Oignon jeune", "Huile d''olive"]',
    '1. Faire revenir tomate/oignon. 2. Ajouter oeufs battus.'
  ),
  (
    'Salade César "Street"', 
    'Classique', 
    'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=2070&auto=format&fit=crop', 
    4.80, 
    400, 
    38, 
    15, 
    20, 
    '["Salade Romaine", "Poulet grillé", "Parmesan", "Croûtons", "Sauce yaourt ail"]',
    '1. Assembler le tout. 2. Sauce légère maison.'
  );
