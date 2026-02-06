-- Fix daily_plans RLS policies
-- Missing UPDATE and DELETE policies

-- Add UPDATE policy
CREATE POLICY "Users can update their own plans"
ON public.daily_plans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy (for future use)
CREATE POLICY "Users can delete their own plans"
ON public.daily_plans
FOR DELETE
USING (auth.uid() = user_id);
