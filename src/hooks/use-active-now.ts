import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfileDetails, computeMatch } from "@/hooks/use-profiles";
import { useAuth } from "@/contexts/AuthContext";

export interface ActiveUser {
  id: string;
  full_name: string;
  avatar_url: string;
  initials: string;
  matchPercent: number;
  lastSeenAt: string;
  /** "online" = <5min, "recent" = 5-15min */
  status: "online" | "recent";
}

export function useActiveNow() {
  const { user } = useAuth();
  const { data: myProfile } = useMyProfileDetails(user?.id);

  return useQuery({
    queryKey: ["active-now", user?.id],
    queryFn: async (): Promise<ActiveUser[]> => {
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, last_seen_at")
        .neq("id", user!.id)
        .eq("onboarding_completed", true)
        .gte("last_seen_at" as any, fifteenMinAgo)
        .order("last_seen_at" as any, { ascending: false })
        .limit(10);

      if (!profiles || profiles.length === 0) return [];

      // Fetch skills/interests for match scoring
      const ids = profiles.map((p) => p.id);
      const [skills, interests, lookingFor] = await Promise.all([
        supabase.from("profile_skills").select("profile_id, skill").in("profile_id", ids),
        supabase.from("profile_interests").select("profile_id, interest").in("profile_id", ids),
        supabase.from("profile_looking_for").select("profile_id, looking_for").in("profile_id", ids),
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

      const fiveMinAgo = Date.now() - 5 * 60 * 1000;

      return profiles
        .map((p) => {
          const otherProfile = {
            id: p.id,
            full_name: p.full_name,
            bio: "",
            instagram: "",
            linkedin: "",
            avatar_url: p.avatar_url ?? "",
            privacy: "public",
            onboarding_completed: true,
            skills: skillsMap[p.id] ?? [],
            interests: interestsMap[p.id] ?? [],
            looking_for: lookingForMap[p.id] ?? [],
            member_types: [],
          };

          const match = myProfile
            ? computeMatch(myProfile, otherProfile)
            : { percent: 70, reasons: [] };

          const lastSeen = (p as any).last_seen_at as string;
          const lastSeenMs = new Date(lastSeen).getTime();

          return {
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url ?? "",
            initials: p.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
            matchPercent: match.percent,
            lastSeenAt: lastSeen,
            status: lastSeenMs > fiveMinAgo ? "online" as const : "recent" as const,
          };
        })
        .sort((a, b) => b.matchPercent - a.matchPercent)
        .slice(0, 5);
    },
    enabled: !!user,
    refetchInterval: 60 * 1000, // refresh every minute
    staleTime: 30 * 1000,
  });
}
