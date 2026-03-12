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

const CONVERSATIONS_PAGE_SIZE = 50;
const CHAT_PAGE_SIZE = 100;

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch only the most recent messages (limited)
      const { data: messages } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, read, created_at")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(CONVERSATIONS_PAGE_SIZE * 20);

      if (!messages || messages.length === 0) return [];

      // Group by conversation partner
      const convMap = new Map<string, { messages: typeof messages; unread: number }>();
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

      // Fetch partner profiles (only needed columns)
      const partnerIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase
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
      return conversations.slice(0, CONVERSATIONS_PAGE_SIZE);
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useChatMessages(userId: string | undefined, partnerId: string | undefined) {
  const qc = useQueryClient();

  // Realtime subscription with server-side filter
  useEffect(() => {
    if (!userId || !partnerId) return;

    const channel = supabase
      .channel(`chat-${userId}-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${partnerId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.receiver_id === userId) {
            // Optimistically add the message to cache
            qc.setQueryData<Message[]>(["chat", userId, partnerId], (old) =>
              old ? [...old, msg] : [msg]
            );
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

      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, read, created_at")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true })
        .limit(CHAT_PAGE_SIZE);

      // Mark unread messages as read
      if (data && data.length > 0) {
        const unreadIds = data
          .filter((m) => m.receiver_id === userId && !m.read)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unreadIds);
          qc.invalidateQueries({ queryKey: ["unread-count", userId] });
        }
      }

      return (data ?? []) as Message[];
    },
    enabled: !!userId && !!partnerId,
    staleTime: 60 * 1000,
  });
}

export function useLoadEarlierMessages(userId: string | undefined, partnerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId || !partnerId) return [];
      const existing = qc.getQueryData<Message[]>(["chat", userId, partnerId]) ?? [];
      const oldest = existing[0]?.created_at;
      if (!oldest) return [];

      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, read, created_at")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
        )
        .lt("created_at", oldest)
        .order("created_at", { ascending: false })
        .limit(CHAT_PAGE_SIZE);

      return ((data ?? []) as Message[]).reverse();
    },
    onSuccess: (older) => {
      if (older.length > 0) {
        qc.setQueryData<Message[]>(["chat", userId, partnerId], (old) =>
          old ? [...older, ...old] : older
        );
      }
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ senderId, receiverId, content }: { senderId: string; receiverId: string; content: string }) => {
      const { error } = await supabase
        .from("messages")
        .insert({ sender_id: senderId, receiver_id: receiverId, content });
      if (error) throw error;
      return { sender_id: senderId, receiver_id: receiverId, content };
    },
    onSuccess: (_data, variables) => {
      // Optimistically add the sent message to cache
      const now = new Date().toISOString();
      const optimisticMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: variables.senderId,
        receiver_id: variables.receiverId,
        content: variables.content,
        read: false,
        created_at: now,
      };
      qc.setQueryData<Message[]>(["chat", variables.senderId, variables.receiverId], (old) =>
        old ? [...old, optimisticMsg] : [optimisticMsg]
      );
      // Invalidate only the specific conversation list
      qc.invalidateQueries({ queryKey: ["conversations", variables.senderId] });
    },
  });
}

/** Subscribe to all incoming messages so the conversation list updates in real-time */
export function useConversationRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`conv-rt-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["conversations", userId] });
          qc.invalidateQueries({ queryKey: ["unread-count", userId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, qc]);
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["unread-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("read", false);
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
