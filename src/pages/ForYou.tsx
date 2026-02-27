import { useState } from "react";
import { ChevronDown, Calendar, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const { data: allProfiles, isLoading } = useAllProfiles(user?.id);
  const { data: myProfile } = useMyProfileDetails(user?.id);
  const { data: myConnections } = useMyConnectionsList(user?.id);

  const getConnectionStatus = (profileId: string): "none" | "sent" | "pending" | "connected" => {
    const conn = (myConnections ?? []).find(
      (c) => (c.requester_id === profileId || c.receiver_id === profileId)
    );
    if (!conn) return "none";
    if (conn.status === "accepted") return "connected";
    if (conn.status === "pending" && conn.requester_id === user?.id) return "sent";
    if (conn.status === "pending" && conn.receiver_id === user?.id) return "pending";
    return "none";
  };

  // Compute matches
  const matchedProfiles = (allProfiles ?? []).map((p) => {
    const match = myProfile ? computeMatch(myProfile, p) : { percent: 70, reasons: ["Hub community member"] };
    return { ...p, matchPercent: match.percent, matchReason: match.reasons[0] };
  });

  // Filter
  const filtered = activeFilter === "All"
    ? matchedProfiles
    : matchedProfiles.filter((p) => p.member_types.includes(FILTER_TO_TYPE[activeFilter] ?? ""));

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "best") return b.matchPercent - a.matchPercent;
    return 0;
  });

  const visible = sorted.slice(0, visibleCount);

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
              <p className="font-mono text-sm text-muted-foreground mb-6">
                New matches based on your profile
              </p>

              {/* Filter pills */}
              <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2">
                {FILTER_PILLS.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setActiveFilter(pill)}
                    className={`whitespace-nowrap px-4 py-2 font-mono text-xs uppercase tracking-wider border-2 transition-all ${
                      activeFilter === pill
                        ? "border-foreground bg-foreground text-primary-foreground shadow-brutal-sm"
                        : "border-foreground bg-background text-foreground hover:bg-accent hover:shadow-brutal-sm"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex justify-end mb-6">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="best">Best Match</option>
                  <option value="recent">Recent</option>
                  <option value="active">Most Active</option>
                </select>
              </div>

              {/* Profile cards */}
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 border-2 border-foreground" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
                  No matches found yet. More people are joining every day!
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
                      skills={match.skills}
                      matchReason={match.matchReason}
                      initials={match.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      photoUrl={match.avatar_url || undefined}
                      connectionStatus={getConnectionStatus(match.id)}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {visibleCount < sorted.length && (
                <div className="mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="w-full h-12 border-2 border-foreground font-mono text-xs uppercase tracking-wider hover:bg-accent hover:shadow-brutal-sm transition-all"
                  >
                    Load More Matches
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
              {/* Stats */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-base uppercase mb-4">Your Community</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-heading text-2xl">{(allProfiles ?? []).length}</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Total Matches</p>
                  </div>
                  <div className="border-l-2 border-r-2 border-foreground">
                    <p className="font-heading text-2xl">{Math.min((allProfiles ?? []).length, 3)}</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">This Week</p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl">
                      {matchedProfiles.length > 0
                        ? Math.round(matchedProfiles.reduce((s, p) => s + p.matchPercent, 0) / matchedProfiles.length)
                        : 0}%
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

              {/* Upcoming events */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Upcoming Events</h3>
                <div className="space-y-3">
                  <div className="border-l-[3px] border-accent bg-accent/10 px-3 py-2">
                    <p className="font-mono text-sm font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Creative Mixer
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">Friday, 7 PM</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ForYou;
