-- =====================================================
-- MIGRATION: Add missing columns to profiles table
-- =====================================================

-- Add avatar_url column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add culture column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS culture text;

-- Add height column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS height int;

-- Add age_range column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_range text;

-- Add is_premium column (for Stripe integration)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Add stripe_customer_id column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text;
