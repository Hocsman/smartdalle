-- Migration: Add culture preference to profiles
-- Run this in Supabase SQL Editor

-- Add culture column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS culture text CHECK (culture IN ('africaine', 'antillaise', 'classique', 'mix'));

-- Update existing profiles to have a default culture (optional)
-- UPDATE public.profiles SET culture = 'mix' WHERE culture IS NULL;
