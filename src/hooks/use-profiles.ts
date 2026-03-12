import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileWithDetails {
  id: string;
  full_name: string;
  bio: string;
  instagram: string;
  linkedin: string;
  avatar_url: string;
  privacy: string;
  onboarding_completed: boolean;
  created_at: string;
  last_seen_at: string | null;
  skills: string[];
  interests: string[];
  looking_for: string[];
  member_types: string[];
}

const PROFILE_COLUMNS = "id, full_name, bio, instagram, linkedin, avatar_url, privacy, onboarding_completed, created_at, last_seen_at";

async function fetchProfileWithDetails(profileId: string): Promise<ProfileWithDetails | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", profileId)
    .maybeSingle();
  if (!profile) return null;

  const [skills, interests, lookingFor, memberTypes] = await Promise.all([
    supabase.from("profile_skills").select("skill").eq("profile_id", profileId),
    supabase.from("profile_interests").select("interest").eq("profile_id", profileId),
    supabase.from("profile_looking_for").select("looking_for").eq("profile_id", profileId),
    supabase.from("profile_member_types").select("member_type").eq("profile_id", profileId),
  ]);

  return {
    ...profile,
    bio: profile.bio ?? "",
    instagram: profile.instagram ?? "",
    linkedin: profile.linkedin ?? "",
    avatar_url: profile.avatar_url ?? "",
    privacy: profile.privacy ?? "public",
    onboarding_completed: profile.onboarding_completed ?? false,
    created_at: profile.created_at ?? "",
    last_seen_at: profile.last_seen_at ?? null,
    skills: (skills.data ?? []).map((r) => r.skill),
    interests: (interests.data ?? []).map((r) => r.interest),
    looking_for: (lookingFor.data ?? []).map((r) => r.looking_for),
    member_types: (memberTypes.data ?? []).map((r) => r.member_type),
  };
}

export function useProfileById(profileId: string | undefined) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfileWithDetails(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

const ALL_PROFILES_LIMIT = 200;

export function useAllProfiles(excludeUserId?: string) {
  return useQuery({
    queryKey: ["all-profiles", excludeUserId],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("onboarding_completed", true)
        .limit(ALL_PROFILES_LIMIT);

      if (!profiles || profiles.length === 0) return [];

      const ids = profiles.map((p) => p.id).filter((id) => id !== excludeUserId);
      if (ids.length === 0) return [];

      const [skills, interests, lookingFor, memberTypes] = await Promise.all([
        supabase.from("profile_skills").select("profile_id, skill").in("profile_id", ids),
        supabase.from("profile_interests").select("profile_id, interest").in("profile_id", ids),
        supabase.from("profile_looking_for").select("profile_id, looking_for").in("profile_id", ids),
        supabase.from("profile_member_types").select("profile_id, member_type").in("profile_id", ids),
      ]);

      const grouped = <T extends { profile_id: string }>(data: T[] | null, key: keyof T) => {
        const map: Record<string, string[]> = {};
        (data ?? []).forEach((row) => {
          const pid = row.profile_id;
          if (!map[pid]) map[pid] = [];
          map[pid].push(row[key] as string);
        });
        return map;
      };

      const skillsMap = grouped(skills.data, "skill");
      const interestsMap = grouped(interests.data, "interest");
      const lookingForMap = grouped(lookingFor.data, "looking_for");
      const memberTypesMap = grouped(memberTypes.data, "member_type");

      return profiles
        .filter((p) => p.id !== excludeUserId)
        .map((p): ProfileWithDetails => ({
          ...p,
          bio: p.bio ?? "",
          instagram: p.instagram ?? "",
          linkedin: p.linkedin ?? "",
          avatar_url: p.avatar_url ?? "",
          privacy: p.privacy ?? "public",
          onboarding_completed: p.onboarding_completed ?? false,
          created_at: p.created_at ?? "",
          last_seen_at: p.last_seen_at ?? null,
          skills: skillsMap[p.id] ?? [],
          interests: interestsMap[p.id] ?? [],
          looking_for: lookingForMap[p.id] ?? [],
          member_types: memberTypesMap[p.id] ?? [],
        }));
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyProfileDetails(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-profile-details", userId],
    queryFn: () => fetchProfileWithDetails(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Compute a simple match percentage based on shared items */
export function computeMatch(
  userProfile: ProfileWithDetails,
  otherProfile: ProfileWithDetails
): { percent: number; reasons: string[] } {
  const sharedSkills = userProfile.skills.filter((s) => otherProfile.skills.includes(s));
  const sharedInterests = userProfile.interests.filter((i) => otherProfile.interests.includes(i));
  const sharedLookingFor = userProfile.looking_for.filter((l) => otherProfile.looking_for.includes(l));

  const reasons: string[] = [];
  if (sharedSkills.length > 0) reasons.push(`Shared skills: ${sharedSkills.join(", ")}`);
  if (sharedInterests.length > 0) reasons.push(`Shared interests: ${sharedInterests.join(", ")}`);
  if (sharedLookingFor.length > 0) reasons.push(`Both looking for: ${sharedLookingFor.join(", ")}`);

  const totalPossible = Math.max(
    userProfile.skills.length + userProfile.interests.length + userProfile.looking_for.length,
    1
  );
  const shared = sharedSkills.length + sharedInterests.length + sharedLookingFor.length;
  const percent = Math.min(99, Math.max(50, Math.round(50 + (shared / totalPossible) * 50)));

  if (reasons.length === 0) reasons.push("Hub community member");

  return { percent, reasons };
}
