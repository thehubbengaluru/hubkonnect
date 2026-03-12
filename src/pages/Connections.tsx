import { useState } from "react";
import { Search, Check, X, Clock, MessageCircle, Sparkles, Eye, Users, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageShell from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useConnections, useAcceptConnection, useDeclineConnection, useCancelConnection, useRemoveConnection } from "@/hooks/use-connections";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

const Connections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useConnections(user?.id);
  const { toast } = useToast();
  const acceptMut = useAcceptConnection();
  const declineMut = useDeclineConnection();
  const cancelMut = useCancelConnection();
  const removeMut = useRemoveConnection();

  const handleAccept = (id: string, name: string) => {
    acceptMut.mutate(id, {
      onSuccess: () => toast({ title: "Connection accepted!", description: `You and ${name} are now connected.` }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleDecline = (id: string) => {
    declineMut.mutate(id, {
      onSuccess: () => toast({ title: "Request declined" }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleCancel = (id: string) => {
    cancelMut.mutate(id, {
      onSuccess: () => toast({ title: "Request cancelled" }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleRemove = (id: string, name: string) => {
    removeMut.mutate(id, {
      onSuccess: () => toast({ title: "Connection removed", description: `You and ${name} are no longer connected.` }),
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

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
          <TabsList className="w-full justify-start bg-transparent border-b-2 border-foreground rounded-none p-0 h-auto gap-0 overflow-x-auto">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-[11px] sm:text-xs uppercase tracking-wider px-3 sm:px-6 py-4 whitespace-nowrap min-h-[48px]">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1 sm:flex-none rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-[11px] sm:text-xs uppercase tracking-wider px-3 sm:px-6 py-4 whitespace-nowrap min-h-[48px]">
              Sent ({sent.length})
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1 sm:flex-none rounded-none border-b-[3px] border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-mono text-[11px] sm:text-xs uppercase tracking-wider px-3 sm:px-6 py-4 whitespace-nowrap min-h-[48px]">
              Connections ({accepted.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 border-2 border-foreground" />
            ) : pending.length === 0 ? (
              <div className="border-2 border-foreground bg-card p-8 text-center shadow-brutal space-y-3">
                <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-mono text-sm text-muted-foreground">No pending requests</p>
                <p className="font-mono text-xs text-muted-foreground">When someone wants to connect with you, it'll show up here.</p>
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

                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <Button size="sm" onClick={() => handleAccept(req.id, req.profile.full_name)} disabled={acceptMut.isPending}
                        className="min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 border-2 border-foreground font-mono text-[11px] sm:text-xs uppercase tracking-wider shadow-brutal-sm gap-1 flex-1 sm:flex-none">
                        <Check className="h-4 w-4" /> {acceptMut.isPending ? "Accepting..." : "Accept"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDecline(req.id)} disabled={declineMut.isPending}
                        className="min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 flex-1 sm:flex-none">
                        <X className="h-4 w-4" /> {declineMut.isPending ? "Declining..." : "Decline"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${req.profile.id}`)}
                        className="min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 border-2 border-foreground font-mono text-[11px] sm:text-xs uppercase tracking-wider gap-1 w-full sm:w-auto mt-1 sm:mt-0">
                        <Eye className="h-4 w-4" /> View Profile
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
              <div className="border-2 border-foreground bg-card p-8 text-center shadow-brutal space-y-3">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-mono text-sm text-muted-foreground">No sent requests</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/for-you")}
                  className="border-2 border-foreground font-mono text-xs uppercase tracking-wider">
                  Find People to Connect With
                </Button>
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
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(req.id)} disabled={cancelMut.isPending}
                        className="min-h-[44px] sm:min-h-[36px] px-4 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none">
                        {cancelMut.isPending ? "Cancelling..." : "Cancel Request"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${req.profile.id}`)}
                        className="min-h-[44px] sm:min-h-[36px] px-4 border-2 border-foreground font-mono text-[11px] sm:text-xs uppercase tracking-wider gap-1 flex-1 sm:flex-none">
                        <Eye className="h-4 w-4" /> View Profile
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
              <div className="border-2 border-foreground bg-card p-8 text-center shadow-brutal mt-4 space-y-3">
                <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-mono text-sm text-muted-foreground">
                  {searchQuery ? `No connections found matching "${searchQuery}"` : "No connections yet"}
                </p>
                {!searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/for-you")}
                    className="border-2 border-foreground font-mono text-xs uppercase tracking-wider">
                    Browse People
                  </Button>
                )}
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
                    <div className="mt-3 space-y-2">
                      <Button size="sm" onClick={() => navigate(`/messages?chat=${conn.profile.id}`)}
                        className="w-full min-h-[44px] sm:min-h-[36px] border-2 border-foreground font-mono text-[11px] sm:text-xs uppercase tracking-wider shadow-brutal-sm gap-1.5">
                        <MessageCircle className="h-4 w-4" /> Message
                      </Button>
                      <button onClick={() => navigate(`/profile/${conn.profile.id}`)}
                        className="w-full min-h-[44px] sm:min-h-[36px] font-mono text-[11px] sm:text-xs text-muted-foreground border-2 border-transparent hover:border-foreground hover:bg-accent hover:text-foreground transition-all flex items-center justify-center">
                        View Profile
                      </button>
                      <button onClick={() => handleRemove(conn.id, conn.profile.full_name)} disabled={removeMut.isPending}
                        className="w-full min-h-[44px] sm:min-h-[36px] font-mono text-[11px] sm:text-xs text-destructive border-2 border-transparent hover:border-destructive hover:bg-destructive/10 transition-all flex items-center justify-center gap-1.5">
                        <UserMinus className="h-4 w-4" /> {removeMut.isPending ? "Removing..." : "Remove Connection"}
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
