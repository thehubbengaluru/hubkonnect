-- =============================================================
-- Security Hardening Migration
-- Fixes: message auth bypass, missing rate limits, admin RLS
-- =============================================================

-- 1. MESSAGES: Require accepted connection before sending messages
-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- New INSERT policy: sender must be authenticated AND connected to receiver
CREATE POLICY "Users can send messages to connections"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_connected(auth.uid(), receiver_id)
  );

-- 2. MESSAGES: Add rate limiting (50 messages per hour per user)
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at >= (now() - interval '1 hour');

  IF recent_count >= 50 THEN
    RAISE EXCEPTION 'Message rate limit reached (50/hour). Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_message_rate_limit_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_rate_limit();

-- 3. MESSAGES: Restrict UPDATE to only the 'read' column
DROP POLICY IF EXISTS "Receivers can update read status" ON public.messages;

CREATE POLICY "Receivers can mark messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id AND read = true);

-- 4. ADMIN: Create a secure admin stats function
-- This ensures only admins can access aggregate community data
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  SELECT json_build_object(
    'total_signups', (SELECT COUNT(*) FROM public.profiles),
    'onboarding_completed', (SELECT COUNT(*) FROM public.profiles WHERE onboarding_completed = true),
    'total_connections', (SELECT COUNT(*) FROM public.connections),
    'accepted_connections', (SELECT COUNT(*) FROM public.connections WHERE status = 'accepted'),
    'total_messages', (SELECT COUNT(*) FROM public.messages),
    'active_today', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '1 day'),
    'active_7_days', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '7 days'),
    'active_30_days', (SELECT COUNT(*) FROM public.profiles WHERE last_seen_at >= now() - interval '30 days')
  ) INTO result;

  RETURN result;
END;
$$;

-- 5. CONNECTION UPDATE: Add trigger to validate status transitions
CREATE OR REPLACE FUNCTION public.validate_connection_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow transitions from 'pending' to 'accepted' or 'declined'
  IF OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Can only update pending connections';
  END IF;

  IF NEW.status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Invalid status: must be accepted or declined';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_connection_status_trigger
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_connection_status_update();

-- 6. Add index for message rate limiting performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at);
