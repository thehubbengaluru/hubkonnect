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

export function useConnections(userId: string | undefined) {
  return useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      if (!userId) return { pending: [], sent: [], accepted: [] };

      // Fetch connections where user is receiver (pending incoming)
      const { data: incoming } = await supabase
        .from("connections")
        .select("*, profile:profiles!connections_requester_id_fkey(id, full_name, bio, avatar_url, instagram)")
        .eq("receiver_id", userId)
        .eq("status", "pending");

      // Fetch connections where user is requester (sent)
      const { data: sent } = await supabase
        .from("connections")
        .select("*, profile:profiles!connections_receiver_id_fkey(id, full_name, bio, avatar_url, instagram)")
        .eq("requester_id", userId)
        .eq("status", "pending");

      // Fetch accepted connections (either side)
      const { data: acceptedReq } = await supabase
        .from("connections")
        .select("*, profile:profiles!connections_receiver_id_fkey(id, full_name, bio, avatar_url, instagram)")
        .eq("requester_id", userId)
        .eq("status", "accepted");

      const { data: acceptedRec } = await supabase
        .from("connections")
        .select("*, profile:profiles!connections_requester_id_fkey(id, full_name, bio, avatar_url, instagram)")
        .eq("receiver_id", userId)
        .eq("status", "accepted");

      return {
        pending: (incoming ?? []) as ConnectionRow[],
        sent: (sent ?? []) as ConnectionRow[],
        accepted: [...(acceptedReq ?? []), ...(acceptedRec ?? [])] as ConnectionRow[],
      };
    },
    enabled: !!userId,
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
  });
}
