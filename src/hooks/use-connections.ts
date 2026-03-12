import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConnectionRow {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    full_name: string;
    bio: string | null;
    avatar_url: string | null;
    instagram: string | null;
  };
}

const CONNECTION_LIMIT = 100;

export function useConnections(userId: string | undefined) {
  return useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      if (!userId) return { pending: [], sent: [], accepted: [] };

      const [incoming, sent, acceptedReq, acceptedRec] = await Promise.all([
        supabase
          .from("connections")
          .select("id, requester_id, receiver_id, status, message, created_at, updated_at, profile:profiles!connections_requester_id_fkey(id, full_name, bio, avatar_url, instagram)")
          .eq("receiver_id", userId)
          .eq("status", "pending")
          .limit(CONNECTION_LIMIT),
        supabase
          .from("connections")
          .select("id, requester_id, receiver_id, status, message, created_at, updated_at, profile:profiles!connections_receiver_id_fkey(id, full_name, bio, avatar_url, instagram)")
          .eq("requester_id", userId)
          .eq("status", "pending")
          .limit(CONNECTION_LIMIT),
        supabase
          .from("connections")
          .select("id, requester_id, receiver_id, status, message, created_at, updated_at, profile:profiles!connections_receiver_id_fkey(id, full_name, bio, avatar_url, instagram)")
          .eq("requester_id", userId)
          .eq("status", "accepted")
          .limit(CONNECTION_LIMIT),
        supabase
          .from("connections")
          .select("id, requester_id, receiver_id, status, message, created_at, updated_at, profile:profiles!connections_requester_id_fkey(id, full_name, bio, avatar_url, instagram)")
          .eq("receiver_id", userId)
          .eq("status", "accepted")
          .limit(CONNECTION_LIMIT),
      ]);

      return {
        pending: (incoming.data ?? []) as ConnectionRow[],
        sent: (sent.data ?? []) as ConnectionRow[],
        accepted: [...(acceptedReq.data ?? []), ...(acceptedRec.data ?? [])] as ConnectionRow[],
      };
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useAcceptConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useDeclineConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("connections")
        .update({ status: "declined" })
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useCancelConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useRemoveConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase.rpc("remove_connection", { connection_id: connectionId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["my-connections-list"] });
      qc.invalidateQueries({ queryKey: ["connection-status"] });
    },
  });
}

export function useSendConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("connections")
        .insert({ requester_id: user.id, receiver_id: receiverId, message: message ?? "" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useConnectionStatus(userId: string | undefined, otherUserId: string | undefined) {
  return useQuery({
    queryKey: ["connection-status", userId, otherUserId],
    queryFn: async () => {
      if (!userId || !otherUserId) return null;
      const { data } = await supabase
        .from("connections")
        .select("id, status, requester_id, receiver_id")
        .or(`and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userId && !!otherUserId,
    staleTime: 60 * 1000,
  });
}

export function useMyConnectionsList(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-connections-list", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("connections")
        .select("id, requester_id, receiver_id, status")
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .limit(500);
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
