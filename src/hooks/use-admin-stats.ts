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

      // Parallel queries
      const [
        profilesRes,
        onboardedRes,
        connectionsRes,
        acceptedRes,
        messagesRes,
        activeTodayRes,
        active7Res,
        active30Res,
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, last_seen_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
        supabase.from("connections").select("id, requester_id, receiver_id, status"),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("messages").select("id, sender_id"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, oneDayAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, sevenDaysAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen_at" as any, thirtyDaysAgo),
      ]);

      const profiles = profilesRes.data ?? [];
      const connections = connectionsRes.data ?? [];
      const messages = messagesRes.data ?? [];
      const totalSignups = profiles.length;
      const totalRequests = connections.length;
      const acceptedCount = acceptedRes.count ?? 0;

      // Users with at least 1 connection
      const connectedUserIds = new Set<string>();
      connections.filter(c => c.status === "accepted").forEach(c => {
        connectedUserIds.add(c.requester_id);
        connectedUserIds.add(c.receiver_id);
      });

      // Users with messages
      const messageSenderIds = new Set(messages.map(m => m.sender_id));

      // Connection counts per user
      const connectionCounts: Record<string, number> = {};
      connections.filter(c => c.status === "accepted").forEach(c => {
        connectionCounts[c.requester_id] = (connectionCounts[c.requester_id] ?? 0) + 1;
        connectionCounts[c.receiver_id] = (connectionCounts[c.receiver_id] ?? 0) + 1;
      });

      // Message counts per user
      const messageCounts: Record<string, number> = {};
      messages.forEach(m => {
        messageCounts[m.sender_id] = (messageCounts[m.sender_id] ?? 0) + 1;
      });

      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name]));

      // Zero-connection users
      const zeroConnectionUsers = profiles
        .filter(p => !connectedUserIds.has(p.id))
        .map(p => p.full_name)
        .slice(0, 10);

      // Power users (5+ connections)
      const powerUsers = Object.entries(connectionCounts)
        .filter(([, count]) => count >= 5)
        .map(([id]) => profileMap[id] ?? id);

      // Top connectors
      const topConnectors = Object.entries(connectionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ name: profileMap[id] ?? id, count }));

      // Top messagers
      const topMessagers = Object.entries(messageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ name: profileMap[id] ?? id, count }));

      const avgConnectionsPerUser = totalSignups > 0
        ? Math.round((acceptedCount * 2 / totalSignups) * 10) / 10
        : 0;

      const avgMessagesPerUser = totalSignups > 0
        ? Math.round((messages.length / totalSignups) * 10) / 10
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
        zeroConnectionUsers,
        powerUsers,
        activeToday: activeTodayRes.count ?? 0,
        active7Days: active7Res.count ?? 0,
        active30Days: active30Res.count ?? 0,
        topConnectors,
        topMessagers,
      };
    },
    staleTime: 30 * 1000,
  });
}
