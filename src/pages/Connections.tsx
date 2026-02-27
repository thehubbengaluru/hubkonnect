import { useState } from "react";
import { Search, Check, X, Clock, MessageCircle, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageShell from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections, useAcceptConnection, useDeclineConnection, useCancelConnection } from "@/hooks/use-connections";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

const Connections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useConnections(user?.id);
  const acceptMut = useAcceptConnection();
  const declineMut = useDeclineConnection();
  const cancelMut = useCancelConnection();

  const pending = data?.pending ?? [];
  const sent = data?.sent ?? [];
  const accepted = data?.accepted ?? [];

  const filteredConnections = accepted.filter((c) =>
    c.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

  return (
    <PageShell>
      <div className="container py-8">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">My Connections</h1>
        <p className="font-mono text-sm text-muted-foreground mb-6">
          People you've connected with at The Hub
        </p>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b-2 border-foreground rounded-none p-0 h-auto gap-0">
            <TabsTrigger value="pending" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3">
              Sent ({sent.length})
            </TabsTrigger>
            <TabsTrigger value="connections" className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider px-4 py-3">
              Connections ({accepted.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 border-2 border-foreground" />
            ) : pending.length === 0 ? (
              <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
                No pending requests
              </div>
            ) : pending.map((req) => (
              <div key={req.id} className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <div className="flex gap-4">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                    {req.profile.avatar_url ? (
                      <img src={req.profile.avatar_url} alt={req.profile.full_name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="font-heading text-sm">{getInitials(req.profile.full_name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="font-heading text-base uppercase">
                        {req.profile.full_name} <span className="font-mono text-xs font-normal normal-case text-muted-foreground">wants to connect</span>
                      </h3>
                    </div>

                    {req.message && (
                      <div className="bg-secondary border border-foreground/20 px-3 py-2">
                        <p className="font-mono text-xs italic text-muted-foreground leading-relaxed">"{req.message}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={() => acceptMut.mutate(req.id)} disabled={acceptMut.isPending}
                        className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider shadow-brutal-sm gap-1">
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => declineMut.mutate(req.id)} disabled={declineMut.isPending}
                        className="h-9 px-4 font-mono text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${req.profile.id}`)}
                        className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider gap-1">
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </div>

                    <p className="font-mono text-[10px] text-muted-foreground text-right">{timeAgo(req.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Sent */}
          <TabsContent value="sent" className="mt-6 space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 border-2 border-foreground" />
            ) : sent.length === 0 ? (
              <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
                No sent requests
              </div>
            ) : sent.map((req) => (
              <div key={req.id} className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <div className="flex gap-4">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                    {req.profile.avatar_url ? (
                      <img src={req.profile.avatar_url} alt={req.profile.full_name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="font-heading text-sm">{getInitials(req.profile.full_name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <h3 className="font-heading text-base uppercase">{req.profile.full_name}</h3>
                    <div className="inline-flex items-center gap-1 bg-warning/20 text-warning-foreground px-3 py-1 font-mono text-[11px] font-bold">
                      <Clock className="h-3 w-3" /> Pending · {timeAgo(req.created_at)}
                    </div>
                    {req.message && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your message:</p>
                        <p className="font-mono text-xs text-muted-foreground italic">"{req.message}"</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => cancelMut.mutate(req.id)} disabled={cancelMut.isPending}
                        className="h-9 px-4 font-mono text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10">
                        Cancel Request
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${req.profile.id}`)}
                        className="h-9 px-4 border-2 border-foreground font-mono text-xs uppercase tracking-wider gap-1">
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* My Connections */}
          <TabsContent value="connections" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connections..." className="border-2 border-foreground bg-background font-mono text-xs h-10 pl-9" />
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 border-2 border-foreground" />)}
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal mt-4">
                {searchQuery ? `No connections found matching "${searchQuery}"` : "No connections yet"}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredConnections.map((conn) => (
                  <div key={conn.id}
                    className="border-2 border-foreground bg-card p-5 shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-center">
                    <div className="h-16 w-16 mx-auto border-2 border-foreground bg-accent flex items-center justify-center mb-3 overflow-hidden">
                      {conn.profile.avatar_url ? (
                        <img src={conn.profile.avatar_url} alt={conn.profile.full_name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="font-heading text-lg">{getInitials(conn.profile.full_name)}</span>
                      )}
                    </div>
                    <h3 className="font-heading text-sm uppercase">{conn.profile.full_name}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">Connected {timeAgo(conn.updated_at)}</p>
                    <div className="mt-3 space-y-1.5">
                      <Button size="sm" className="w-full h-8 border-2 border-foreground font-mono text-[10px] uppercase tracking-wider shadow-brutal-sm gap-1">
                        <MessageCircle className="h-3 w-3" /> Message
                      </Button>
                      <button onClick={() => navigate(`/profile/${conn.profile.id}`)}
                        className="w-full font-mono text-[10px] text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors py-1">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default Connections;
