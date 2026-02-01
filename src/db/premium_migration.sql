-- Add premium fields to profiles table
alter table profiles 
add column if not exists is_premium boolean default false;

alter table profiles 
add column if not exists stripe_customer_id text;

-- Create subscriptions table (optional but good for history)
create table if not exists subscriptions (
  id text primary key, -- Stripe Subscription ID
  user_id uuid references auth.users(id) not null,
  status text not null, -- active, canceling, canceled, past_due
  price_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);
