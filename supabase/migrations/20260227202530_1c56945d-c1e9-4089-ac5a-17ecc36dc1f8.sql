
-- =============================================
-- Phase 1A: Helper functions (SECURITY DEFINER)
-- =============================================

-- Get profile privacy value without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_profile_visibility(target_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(privacy, 'public') FROM public.profiles WHERE id = target_id
$$;

-- Check if two users have an accepted connection
CREATE OR REPLACE FUNCTION public.is_connected(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND (
        (requester_id = user_a AND receiver_id = user_b)
        OR (requester_id = user_b AND receiver_id = user_a)
      )
  )
$$;

-- Check connection rate limit (10/day)
CREATE OR REPLACE FUNCTION public.check_connection_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_count integer;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM public.connections
  WHERE requester_id = NEW.requester_id
    AND created_at >= (now() AT TIME ZONE 'UTC')::date;
  
  IF today_count >= 10 THEN
    RAISE EXCEPTION 'Daily connection request limit reached (10/day)';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Prevent reverse-direction duplicate connections
CREATE OR REPLACE FUNCTION public.prevent_duplicate_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.connections
    WHERE (requester_id = NEW.receiver_id AND receiver_id = NEW.requester_id)
  ) THEN
    RAISE EXCEPTION 'A connection already exists between these users';
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- Phase 1B: Replace SELECT policies on profiles
-- =============================================

-- Drop old permissive SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Owner always sees own profile; public profiles visible to all authenticated; 
-- members/private profiles only if connected
CREATE POLICY "Users can view visible profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (
      auth.uid() IS NOT NULL
      AND (
        public.get_profile_visibility(id) = 'public'
        OR (
          public.get_profile_visibility(id) = 'members'
          AND auth.uid() IS NOT NULL
        )
        OR public.is_connected(auth.uid(), id)
      )
    )
  );

-- =============================================
-- Phase 1B: Replace SELECT policies on junction tables
-- =============================================

-- profile_skills
DROP POLICY IF EXISTS "Authenticated users can view all skills" ON public.profile_skills;
CREATE POLICY "Users can view visible profile skills"
  ON public.profile_skills FOR SELECT
  USING (
    auth.uid() = profile_id
    OR (
      auth.uid() IS NOT NULL
      AND (
        public.get_profile_visibility(profile_id) IN ('public', 'members')
        OR public.is_connected(auth.uid(), profile_id)
      )
    )
  );

-- profile_interests
DROP POLICY IF EXISTS "Authenticated users can view all interests" ON public.profile_interests;
CREATE POLICY "Users can view visible profile interests"
  ON public.profile_interests FOR SELECT
  USING (
    auth.uid() = profile_id
    OR (
      auth.uid() IS NOT NULL
      AND (
        public.get_profile_visibility(profile_id) IN ('public', 'members')
        OR public.is_connected(auth.uid(), profile_id)
      )
    )
  );

-- profile_member_types
DROP POLICY IF EXISTS "Authenticated users can view all member types" ON public.profile_member_types;
CREATE POLICY "Users can view visible profile member types"
  ON public.profile_member_types FOR SELECT
  USING (
    auth.uid() = profile_id
    OR (
      auth.uid() IS NOT NULL
      AND (
        public.get_profile_visibility(profile_id) IN ('public', 'members')
        OR public.is_connected(auth.uid(), profile_id)
      )
    )
  );

-- profile_looking_for
DROP POLICY IF EXISTS "Authenticated users can view all looking_for" ON public.profile_looking_for;
CREATE POLICY "Users can view visible profile looking for"
  ON public.profile_looking_for FOR SELECT
  USING (
    auth.uid() = profile_id
    OR (
      auth.uid() IS NOT NULL
      AND (
        public.get_profile_visibility(profile_id) IN ('public', 'members')
        OR public.is_connected(auth.uid(), profile_id)
      )
    )
  );

-- =============================================
-- Phase 1C: Tighten connection UPDATE policy
-- =============================================

DROP POLICY IF EXISTS "Receivers can update connection status" ON public.connections;
CREATE POLICY "Receivers can update connection status"
  ON public.connections FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (
    status IN ('accepted', 'declined')
  );

-- =============================================
-- Phase 1D: Rate limiting trigger
-- =============================================

CREATE TRIGGER check_connection_rate_limit_trigger
  BEFORE INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.check_connection_rate_limit();

-- =============================================
-- Phase 1E: Reverse-direction duplicate trigger
-- =============================================

CREATE TRIGGER prevent_duplicate_connection_trigger
  BEFORE INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_connection();

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON public.connections(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_status ON public.connections(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON public.profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_profile_id ON public.profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_member_types_profile_id ON public.profile_member_types(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_looking_for_profile_id ON public.profile_looking_for(profile_id);
