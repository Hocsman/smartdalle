-- Create WEIGHT_LOGS Table
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weight decimal not null,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.weight_logs enable row level security;

create policy "Users can view their own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

-- Optional: Unique constraint to allow one log per day per user?
-- For MVP we can allow multiple, or just let them pile up. Let's keep it simple.
