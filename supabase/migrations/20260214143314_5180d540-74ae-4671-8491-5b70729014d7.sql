
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  privacy TEXT DEFAULT 'public',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Profile member types
CREATE TABLE public.profile_member_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_type TEXT NOT NULL,
  UNIQUE(profile_id, member_type)
);

ALTER TABLE public.profile_member_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all member types"
  ON public.profile_member_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own member types"
  ON public.profile_member_types FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own member types"
  ON public.profile_member_types FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Profile skills
CREATE TABLE public.profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  UNIQUE(profile_id, skill)
);

ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all skills"
  ON public.profile_skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own skills"
  ON public.profile_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own skills"
  ON public.profile_skills FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Profile interests
CREATE TABLE public.profile_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  UNIQUE(profile_id, interest)
);

ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all interests"
  ON public.profile_interests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own interests"
  ON public.profile_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own interests"
  ON public.profile_interests FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Profile looking for
CREATE TABLE public.profile_looking_for (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  looking_for TEXT NOT NULL,
  UNIQUE(profile_id, looking_for)
);

ALTER TABLE public.profile_looking_for ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all looking_for"
  ON public.profile_looking_for FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own looking_for"
  ON public.profile_looking_for FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own looking_for"
  ON public.profile_looking_for FOR DELETE TO authenticated USING (auth.uid() = profile_id);

-- Connections
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert own connection requests"
  ON public.connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Receivers can update connection status"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Requesters can delete own requests"
  ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
