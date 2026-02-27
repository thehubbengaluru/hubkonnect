import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BetaStats {
  totalMembers: number;
  totalConnections: number;
  avgMatchRate: number;
}

export function useBetaStats() {
  return useQuery({
    queryKey: ["beta-stats"],
    queryFn: async (): Promise<BetaStats> => {
      const [membersRes, connectionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("onboarding_completed", true),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("status", "accepted"),
      ]);

      const totalMembers = membersRes.count ?? 0;
      const totalConnections = connectionsRes.count ?? 0;

      return {
        totalMembers,
        totalConnections,
        avgMatchRate: totalMembers > 0 ? Math.min(95, 70 + totalMembers) : 0,
      };
    },
    staleTime: 60 * 1000,
  });
}
