-- Add last_seen_at to profiles for presence tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Index for active-now queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at 
  ON public.profiles (last_seen_at DESC);