import { useState, useMemo, useCallback } from "react";
import { Users, Calendar, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageShell from "@/components/PageShell";
import ProfileCard from "@/components/ProfileCard";
import ConcentricCircles from "@/components/ConcentricCircles";
import { useAuth } from "@/contexts/AuthContext";
import { useAllProfiles, useMyProfileDetails, computeMatch } from "@/hooks/use-profiles";
import { useMyConnectionsList } from "@/hooks/use-connections";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveNow } from "@/hooks/use-active-now";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { isNewMember } from "@/lib/utils";

const FILTER_PILLS = ["All", "Co-living", "Co-working", "Events", "Followers"];
const FILTER_TO_TYPE: Record<string, string> = {
  "Co-living": "co_living",
  "Co-working": "co_working",
  "Events": "event_attendee",
  "Followers": "follower",
};

const ForYou = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("best");
  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  const { data: allProfiles, isLoading } = useAllProfiles(user?.id);
  const { data: myProfile } = useMyProfileDetails(user?.id);
  const { data: myConnections } = useMyConnectionsList(user?.id);

  const getConnectionStatus = useCallback((profileId: string): "none" | "sent" | "pending" | "connected" => {
    const conn = (myConnections ?? []).find(
      (c) => (c.requester_id === profileId || c.receiver_id === profileId)
    );
    if (!conn) return "none";
    if (conn.status === "accepted") return "connected";
    if (conn.status === "pending" && conn.requester_id === user?.id) return "sent";
    if (conn.status === "pending" && conn.receiver_id === user?.id) return "pending";
    return "none";
  }, [myConnections, user?.id]);

  // Compute matches — memoized to avoid O(n) on every render
  const matchedProfiles = useMemo(() =>
    (allProfiles ?? []).map((p) => {
      const match = myProfile ? computeMatch(myProfile, p) : { percent: 70, reasons: ["Hub community member"] };
      return { ...p, matchPercent: match.percent, matchReasons: match.reasons };
    }),
    [allProfiles, myProfile]
  );

  // Filter + sort + search — memoized
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = matchedProfiles.filter((p) => {
      const passesType = activeFilter === "All" || p.member_types.includes(FILTER_TO_TYPE[activeFilter] ?? "");
      const passesSearch = !q || (
        p.full_name.toLowerCase().includes(q) ||
        (p.bio ?? "").toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q))
      );
      return passesType && passesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "best") return b.matchPercent - a.matchPercent;
      if (sortBy === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "active") {
        const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
        const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

    return sorted.slice(0, visibleCount);
  }, [matchedProfiles, activeFilter, sortBy, visibleCount, search]);

  const { data: activeNowUsers, isLoading: activeLoading } = useActiveNow();

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <ConcentricCircles className="absolute -top-32 -right-32 w-96 h-96 text-foreground pointer-events-none opacity-5" />

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main feed */}
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-3xl md:text-4xl uppercase mb-1">For You</h1>
              <p className="font-mono text-sm text-muted-foreground mb-4">
                New matches based on your profile
              </p>

              {/* Search bar */}
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setVisibleCount(6); }}
                  placeholder="Search by name, skill, or bio..."
                  className="w-full border-2 border-foreground bg-background font-mono text-sm h-11 pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter pills with scroll-fade indicator */}
              <div className="relative mb-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scroll-smooth" role="group" aria-label="Filter by member type"
                  style={{ maskImage: "linear-gradient(to right, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)" }}>
                  {FILTER_PILLS.map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setActiveFilter(pill)}
                      aria-pressed={activeFilter === pill}
                      className={`whitespace-nowrap px-4 py-3 min-h-[44px] sm:min-h-[36px] font-mono text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-center ${
                        activeFilter === pill
                          ? "border-foreground bg-foreground text-primary-foreground shadow-brutal-sm"
                          : "border-foreground bg-background text-foreground hover:bg-accent hover:shadow-brutal-sm"
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex justify-end mb-6">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider h-11 sm:h-9 focus:ring-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-foreground font-mono text-xs uppercase">
                    <SelectItem value="best" className="font-mono text-xs uppercase tracking-wider">Best Match</SelectItem>
                    <SelectItem value="recent" className="font-mono text-xs uppercase tracking-wider">Recent</SelectItem>
                    <SelectItem value="active" className="font-mono text-xs uppercase tracking-wider">Most Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile cards */}
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 border-2 border-foreground" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="border-2 border-foreground bg-card p-8 text-center shadow-brutal space-y-3">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="font-mono text-sm text-muted-foreground">
                    {search.trim()
                      ? `No results for "${search}".`
                      : activeFilter !== "All"
                      ? `No ${activeFilter} members found.`
                      : "No matches found yet. More people are joining every day!"}
                  </p>
                  {(search.trim() || activeFilter !== "All") && (
                    <Button variant="outline" size="sm" onClick={() => { setActiveFilter("All"); setSearch(""); }}
                      className="border-2 border-foreground font-mono text-xs uppercase tracking-wider min-h-[44px] sm:min-h-[36px] w-full sm:w-auto">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {visible.map((match) => (
                    <ProfileCard
                      key={match.id}
                      id={match.id}
                      name={match.full_name}
                      handle=""
                      bio={match.bio}
                      matchPercent={match.matchPercent}
                      matchReasons={match.matchReasons}
                      skills={match.skills}
                      isNew={isNewMember(match.created_at)}
                      initials={match.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      photoUrl={match.avatar_url || undefined}
                      connectionStatus={getConnectionStatus(match.id)}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {visibleCount < matchedProfiles.length && (
                <div className="mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="w-full h-12 border-2 border-foreground font-mono text-xs uppercase tracking-wider hover:bg-accent hover:shadow-brutal-sm transition-all"
                  >
                    Load More ({Math.min(6, matchedProfiles.length - visibleCount)} of {matchedProfiles.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
              {/* Stats */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-base uppercase mb-4">Your Community</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="font-heading text-2xl">{(allProfiles ?? []).length}</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Members</p>
                  </div>
                  <div className="border-l-2 border-foreground">
                    <p className="font-heading text-2xl">
                      {matchedProfiles.length > 0
                        ? `${Math.round(matchedProfiles.reduce((s, p) => s + p.matchPercent, 0) / matchedProfiles.length)}%`
                        : "--"}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Avg Match</p>
                  </div>
                </div>
              </div>

              {/* Active now */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Active Now</h3>
                {activeLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : !activeNowUsers || activeNowUsers.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground">No one online right now. Check back later!</p>
                ) : (
                  <div className="space-y-3">
                    {activeNowUsers.map((u) => (
                      <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3 group">
                        <div className="relative">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.full_name} className="h-8 w-8 border-2 border-foreground object-cover" />
                          ) : (
                            <div className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center">
                              <span className="font-mono text-[10px] font-bold">{u.initials}</span>
                            </div>
                          )}
                          <div className={`absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border border-background rounded-full ${
                            u.status === "online" ? "bg-green-500" : "bg-amber-400"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-sm group-hover:underline decoration-accent decoration-2 underline-offset-2 block truncate">
                            {u.full_name}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {u.matchPercent}% match · {u.status === "online" ? "Online now" : formatDistanceToNow(new Date(u.lastSeenAt), { addSuffix: true })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Hub tip */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Hub Events
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Check The Hub's notice board or ask the front desk for this week's events and meetups.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ForYou;
