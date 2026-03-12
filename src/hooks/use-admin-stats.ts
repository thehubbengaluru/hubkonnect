import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  // Activation funnel
  totalSignups: number;
  onboardingCompleted: number;
  usersWithConnections: number;
  usersWithMessages: number;

  // Engagement
  dailyActive: number;
  weeklyActive: number;
  avgConnectionsPerUser: number;
  avgMessagesPerUser: number;

  // Connection funnel
  totalRequests: number;
  acceptedRequests: number;
  acceptRate: number;
  zeroConnectionUsers: string[];
  powerUsers: string[];

  // Retention
  activeToday: number;
  active7Days: number;
  active30Days: number;

  // Top members
  topConnectors: { name: string; count: number }[];
  topMessagers: { name: string; count: number }[];
}

export function useAdminStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["admin-stats"],
    enabled,
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Use count-only queries instead of fetching full rows
      const [
        profilesCountRes,
        onboardedRes,
        totalConnectionsRes,
        acceptedRes,
        totalMessagesRes,
        activeTodayRes,
        active7Res,
        active30Res,
        connectedProfilesRes,
        messageProfilesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
        supabase.from("connections").select("id", { count: "exact", head: true }),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, oneDayAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, sevenDaysAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, thirtyDaysAgo),
        // Lightweight queries for top-user computation
        supabase.from("connections").select("requester_id, receiver_id").eq("status", "accepted").limit(500),
        supabase.from("messages").select("sender_id").limit(500),
      ]);

      const totalSignups = profilesCountRes.count ?? 0;
      const totalRequests = totalConnectionsRes.count ?? 0;
      const acceptedCount = acceptedRes.count ?? 0;
      const totalMessages = totalMessagesRes.count ?? 0;

      // Users with at least 1 accepted connection
      const connectedUserIds = new Set<string>();
      const connectionCounts: Record<string, number> = {};
      (connectedProfilesRes.data ?? []).forEach(c => {
        connectedUserIds.add(c.requester_id);
        connectedUserIds.add(c.receiver_id);
        connectionCounts[c.requester_id] = (connectionCounts[c.requester_id] ?? 0) + 1;
        connectionCounts[c.receiver_id] = (connectionCounts[c.receiver_id] ?? 0) + 1;
      });

      // Users with messages
      const messageCounts: Record<string, number> = {};
      const messageSenderIds = new Set<string>();
      (messageProfilesRes.data ?? []).forEach(m => {
        messageSenderIds.add(m.sender_id);
        messageCounts[m.sender_id] = (messageCounts[m.sender_id] ?? 0) + 1;
      });

      // Get names for top users only
      const topUserIds = [
        ...Object.keys(connectionCounts).sort((a, b) => (connectionCounts[b] ?? 0) - (connectionCounts[a] ?? 0)).slice(0, 5),
        ...Object.keys(messageCounts).sort((a, b) => (messageCounts[b] ?? 0) - (messageCounts[a] ?? 0)).slice(0, 5),
      ];
      const uniqueTopIds = [...new Set(topUserIds)];
      const { data: topProfiles } = uniqueTopIds.length > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", uniqueTopIds)
        : { data: [] };
      const profileMap = Object.fromEntries((topProfiles ?? []).map(p => [p.id, p.full_name]));

      const powerUsers = Object.entries(connectionCounts)
        .filter(([, count]) => count >= 5)
        .map(([id]) => profileMap[id] ?? id);

      const topConnectors = Object.entries(connectionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ name: profileMap[id] ?? id, count }));

      const topMessagers = Object.entries(messageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ name: profileMap[id] ?? id, count }));

      const avgConnectionsPerUser = totalSignups > 0
        ? Math.round((acceptedCount * 2 / totalSignups) * 10) / 10
        : 0;

      const avgMessagesPerUser = totalSignups > 0
        ? Math.round((totalMessages / totalSignups) * 10) / 10
        : 0;

      return {
        totalSignups,
        onboardingCompleted: onboardedRes.count ?? 0,
        usersWithConnections: connectedUserIds.size,
        usersWithMessages: messageSenderIds.size,
        dailyActive: activeTodayRes.count ?? 0,
        weeklyActive: active7Res.count ?? 0,
        avgConnectionsPerUser,
        avgMessagesPerUser,
        totalRequests,
        acceptedRequests: acceptedCount,
        acceptRate: totalRequests > 0 ? Math.round((acceptedCount / totalRequests) * 100) : 0,
        zeroConnectionUsers: [],
        powerUsers,
        activeToday: activeTodayRes.count ?? 0,
        active7Days: active7Res.count ?? 0,
        active30Days: active30Res.count ?? 0,
        topConnectors,
        topMessagers,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
