import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Send, MessageCircle, Search, CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useChatMessages, useSendMessage, useLoadEarlierMessages, useConversationRealtime } from "@/hooks/use-messages";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/** Lightweight typing indicator using Supabase Realtime Presence */
function useTypingIndicator(userId: string | undefined, partnerId: string | undefined) {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!userId || !partnerId) return;
    const roomId = [userId, partnerId].sort().join("-");
    const channel = supabase.channel(`typing-${roomId}`, { config: { presence: { key: userId } } });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const partnerState = state[partnerId] as any[] | undefined;
        const isTyping = partnerState?.some((s: any) => s.typing);
        setPartnerTyping(!!isTyping);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, partnerId]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current) return;
    channelRef.current.track({ typing: true });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      channelRef.current?.track({ typing: false });
    }, 2000);
  }, []);

  return { partnerTyping, sendTyping };
}

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeChat = searchParams.get("chat");
  const { data: conversations, isLoading } = useConversations(user?.id);
  useConversationRealtime(user?.id);
  const { data: messages } = useChatMessages(user?.id, activeChat ?? undefined);
  const { toast } = useToast();
  const sendMessage = useSendMessage();
  const loadEarlier = useLoadEarlierMessages(user?.id, activeChat ?? undefined);
  const [newMsg, setNewMsg] = useState("");
  const [convSearch, setConvSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations?.find((c) => c.partnerId === activeChat);
  const { partnerTyping, sendTyping } = useTypingIndicator(user?.id, activeChat ?? undefined);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!convSearch.trim()) return conversations;
    const q = convSearch.toLowerCase();
    return conversations.filter((c) => c.partnerName.toLowerCase().includes(q));
  }, [conversations, convSearch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;
    try {
      await sendMessage.mutateAsync({ senderId: user!.id, receiverId: activeChat, content: newMsg.trim() });
      setNewMsg("");
    } catch (err: any) {
      const msg = err?.message ?? "Failed to send message";
      if (msg.includes("rate limit") || msg.includes("50/hour")) {
        toast({ title: "Rate limit reached", description: "You can send up to 50 messages per hour. Try again later.", variant: "destructive" });
      } else {
        toast({ title: "Failed to send", description: msg, variant: "destructive" });
      }
    }
  };

  return (
    <PageShell>
      <div className="container py-8">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">Messages</h1>
        <p className="font-mono text-sm text-muted-foreground mb-6">Chat with your connections</p>

        <div className="border-2 border-foreground bg-card shadow-brutal flex h-[calc(100vh-14rem)] sm:h-[60vh] md:h-[65vh]">
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r-2 border-foreground flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b-2 border-foreground space-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Conversations</p>
              {conversations && conversations.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={convSearch}
                    onChange={(e) => setConvSearch(e.target.value)}
                    placeholder="Search..."
                    className="border border-foreground bg-background font-mono text-[11px] h-8 pl-8"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Conversations">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 border border-foreground" />)}
                </div>
              ) : !conversations || conversations.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-muted-foreground">
                  No conversations yet. Connect with someone and start chatting!
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-muted-foreground">
                  No conversations matching "{convSearch}"
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSearchParams({ chat: conv.partnerId })}
                    aria-selected={activeChat === conv.partnerId}
                    role="option"
                    className={`w-full text-left p-3 border-b border-foreground/20 hover:bg-accent/20 transition-colors flex gap-3 items-center ${
                      activeChat === conv.partnerId ? "bg-accent/20" : ""
                    }`}
                  >
                    <div className="h-10 w-10 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                      {conv.partnerAvatar ? (
                        <img src={conv.partnerAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-mono text-xs font-bold">{getInitials(conv.partnerName)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-mono text-sm font-bold truncate">{conv.partnerName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 bg-accent text-accent-foreground font-mono text-[10px] font-bold px-1.5 py-0.5 border border-foreground">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
            {activeChat && activeConv ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b-2 border-foreground flex items-center gap-3">
                  <button onClick={() => setSearchParams({})} className="md:hidden" aria-label="Back to conversations">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                    {activeConv.partnerAvatar ? (
                      <img src={activeConv.partnerAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-mono text-[10px] font-bold">{getInitials(activeConv.partnerName)}</span>
                    )}
                  </div>
                  <p className="font-heading text-sm uppercase">{activeConv.partnerName}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages && messages.length >= 100 && (
                    <button
                      onClick={() => loadEarlier.mutate()}
                      disabled={loadEarlier.isPending}
                      className="w-full text-center font-mono text-[11px] text-muted-foreground hover:text-foreground py-2 transition-colors"
                    >
                      {loadEarlier.isPending ? "Loading..." : "Load earlier messages"}
                    </button>
                  )}
                  {messages?.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] border-2 border-foreground p-3 ${
                          isMine ? "bg-foreground text-primary-foreground" : "bg-background"
                        }`}>
                          <p className="font-mono text-sm">{msg.content}</p>
                          <p className={`font-mono text-[10px] mt-1 flex items-center gap-1 ${isMine ? "text-primary-foreground/60 justify-end" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            {isMine && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {partnerTyping && (
                  <div className="px-4 py-1">
                    <span className="font-mono text-[11px] text-muted-foreground animate-pulse">
                      {activeConv?.partnerName.split(" ")[0]} is typing...
                    </span>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t-2 border-foreground flex gap-2">
                  <Input
                    value={newMsg}
                    onChange={(e) => { setNewMsg(e.target.value); sendTyping(); }}
                    placeholder="Type a message..."
                    className="border-2 border-foreground bg-background font-mono text-sm h-10 flex-1"
                  />
                  <Button type="submit" disabled={!newMsg.trim() || sendMessage.isPending}
                    className="h-10 px-4 border-2 border-foreground shadow-brutal-sm font-mono text-xs uppercase">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="font-mono text-sm text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Messages;
