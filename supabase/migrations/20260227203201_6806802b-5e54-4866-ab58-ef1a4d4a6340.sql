-- Indexes on junction tables for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON public.profile_skills (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_profile_id ON public.profile_interests (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_member_types_profile_id ON public.profile_member_types (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_looking_for_profile_id ON public.profile_looking_for (profile_id);

-- Indexes on connections for common queries
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections (requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections (receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections (status);

-- Foreign keys on connections -> profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'connections_requester_id_fkey' AND table_name = 'connections'
  ) THEN
    ALTER TABLE public.connections
      ADD CONSTRAINT connections_requester_id_fkey
      FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'connections_receiver_id_fkey' AND table_name = 'connections'
  ) THEN
    ALTER TABLE public.connections
      ADD CONSTRAINT connections_receiver_id_fkey
      FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Unique constraint to prevent duplicate connection pairs using LEAST/GREATEST
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique_pair
  ON public.connections (LEAST(requester_id, receiver_id), GREATEST(requester_id, receiver_id));