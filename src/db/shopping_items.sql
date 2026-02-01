-- TABLE SHOPPING_ITEMS (Liste de courses persistante)
create table if not exists public.shopping_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  ingredient_name text not null,
  quantity text, -- ex: "150g", "2 pièces"
  is_checked boolean default false,
  recipe_id uuid references public.recipes(id) on delete set null, -- Source optionnelle
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour accélérer les requêtes par user
create index if not exists shopping_items_user_id_idx on public.shopping_items(user_id);

-- Active RLS (Row Level Security)
alter table public.shopping_items enable row level security;

-- Policies: Chaque utilisateur ne voit/modifie que ses propres items
create policy "Users can view their own shopping items"
  on public.shopping_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shopping items"
  on public.shopping_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own shopping items"
  on public.shopping_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own shopping items"
  on public.shopping_items for delete
  using (auth.uid() = user_id);
