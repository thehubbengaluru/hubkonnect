import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: messages } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (!messages || messages.length === 0) return [];

      // Group by conversation partner
      const convMap = new Map<string, { messages: any[]; unread: number }>();
      for (const msg of messages) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { messages: [], unread: 0 });
        }
        const conv = convMap.get(partnerId)!;
        conv.messages.push(msg);
        if (!msg.read && msg.receiver_id === userId) {
          conv.unread++;
        }
      }

      // Fetch partner profiles
      const partnerIds = Array.from(convMap.keys());
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", partnerIds);

      const profileMap = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p]));

      const conversations: Conversation[] = partnerIds.map((pid) => {
        const conv = convMap.get(pid)!;
        const profile = profileMap.get(pid);
        const lastMsg = conv.messages[0];
        return {
          partnerId: pid,
          partnerName: profile?.full_name ?? "Unknown",
          partnerAvatar: profile?.avatar_url ?? null,
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.created_at,
          unreadCount: conv.unread,
        };
      });

      conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      return conversations;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useChatMessages(userId: string | undefined, partnerId: string | undefined) {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!userId || !partnerId) return;

    const channel = supabase
      .channel(`chat-${userId}-${partnerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === userId && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === userId)
          ) {
            qc.invalidateQueries({ queryKey: ["chat", userId, partnerId] });
            qc.invalidateQueries({ queryKey: ["conversations", userId] });
            qc.invalidateQueries({ queryKey: ["unread-count", userId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId, qc]);

  return useQuery({
    queryKey: ["chat", userId, partnerId],
    queryFn: async () => {
      if (!userId || !partnerId) return [];

      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      // Mark unread messages as read
      if (data && data.length > 0) {
        const unreadIds = data
          .filter((m: Message) => m.receiver_id === userId && !m.read)
          .map((m: Message) => m.id);
        if (unreadIds.length > 0) {
          await (supabase as any)
            .from("messages")
            .update({ read: true })
            .in("id", unreadIds);
          qc.invalidateQueries({ queryKey: ["unread-count", userId] });
        }
      }

      return (data ?? []) as Message[];
    },
    enabled: !!userId && !!partnerId,
    staleTime: 10 * 1000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any)
        .from("messages")
        .insert({ sender_id: user.id, receiver_id: receiverId, content });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["unread-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await (supabase as any)
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("read", false);
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
