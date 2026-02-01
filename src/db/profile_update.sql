-- Update PROFILES table to add height and age_range
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height int,
ADD COLUMN IF NOT EXISTS age_range text check (age_range in ('16-29', '30-49', '50-69', '70+'));
