import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useChatMessages, useSendMessage } from "@/hooks/use-messages";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeChat = searchParams.get("chat");
  const { data: conversations, isLoading } = useConversations(user?.id);
  const { data: messages } = useChatMessages(user?.id, activeChat ?? undefined);
  const sendMessage = useSendMessage();
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations?.find((c) => c.partnerId === activeChat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;
    await sendMessage.mutateAsync({ receiverId: activeChat, content: newMsg.trim() });
    setNewMsg("");
  };

  return (
    <PageShell>
      <div className="container py-8">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">Messages</h1>
        <p className="font-mono text-sm text-muted-foreground mb-6">Chat with your connections</p>

        <div className="border-2 border-foreground bg-card shadow-brutal flex h-[60vh] md:h-[65vh]">
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r-2 border-foreground flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b-2 border-foreground">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 border border-foreground" />)}
                </div>
              ) : !conversations || conversations.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-muted-foreground">
                  No conversations yet. Connect with someone and start chatting!
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSearchParams({ chat: conv.partnerId })}
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
                  <button onClick={() => setSearchParams({})} className="md:hidden">
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
                  {messages?.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] border-2 border-foreground p-3 ${
                          isMine ? "bg-foreground text-primary-foreground" : "bg-background"
                        }`}>
                          <p className="font-mono text-sm">{msg.content}</p>
                          <p className={`font-mono text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t-2 border-foreground flex gap-2">
                  <Input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
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
                <p className="font-mono text-sm text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Messages;
