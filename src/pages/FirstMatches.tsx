import { useState } from "react";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageShell from "@/components/PageShell";
import ProfileCard from "@/components/ProfileCard";
import { useAuth } from "@/contexts/AuthContext";
import { useAllProfiles, useMyProfileDetails, computeMatch } from "@/hooks/use-profiles";
import { Skeleton } from "@/components/ui/skeleton";
import { isNewMember } from "@/lib/utils";

const FirstMatches = () => {
  const { user } = useAuth();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sortBy, setSortBy] = useState("best");
  const [filterType, setFilterType] = useState("all");

  const { data: allProfiles, isLoading } = useAllProfiles(user?.id);
  const { data: myProfile } = useMyProfileDetails(user?.id);

  const matchedProfiles = (allProfiles ?? []).map((p) => {
    const match = myProfile ? computeMatch(myProfile, p) : { percent: 70, reasons: ["Hub community member"] };
    return { ...p, matchPercent: match.percent, matchReasons: match.reasons };
  });

  const filtered = filterType === "all"
    ? matchedProfiles
    : matchedProfiles.filter((p) => p.member_types.includes(filterType));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "best") return b.matchPercent - a.matchPercent;
    return 0;
  });

  return (
    <PageShell>
      <div className="container py-8">
        {bannerVisible && (
          <div className="relative border-2 border-foreground bg-foreground text-primary-foreground p-6 md:p-8 mb-8 shadow-brutal">
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute top-3 right-3 text-primary-foreground/60 hover:text-primary-foreground"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-2xl md:text-3xl uppercase mb-2">
              Welcome to Hub Konnect
            </h2>
            <p className="font-mono text-sm text-primary-foreground/70 max-w-xl">
              Here are {sorted.length} people we think you'll vibe with based on your skills, interests, and what you're looking for.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl uppercase">Your Matches</h2>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider h-10 focus:ring-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-foreground font-mono text-xs uppercase">
                <SelectItem value="best" className="font-mono text-xs uppercase tracking-wider">Best Match</SelectItem>
                <SelectItem value="recent" className="font-mono text-xs uppercase tracking-wider">Recent</SelectItem>
                <SelectItem value="active" className="font-mono text-xs uppercase tracking-wider">Most Active</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider h-10 focus:ring-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-foreground font-mono text-xs uppercase">
                <SelectItem value="all" className="font-mono text-xs uppercase tracking-wider">All Types</SelectItem>
                <SelectItem value="co_living" className="font-mono text-xs uppercase tracking-wider">Co-living</SelectItem>
                <SelectItem value="co_working" className="font-mono text-xs uppercase tracking-wider">Co-working</SelectItem>
                <SelectItem value="event_attendee" className="font-mono text-xs uppercase tracking-wider">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 border-2 border-foreground" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
            No matches found yet. More people are joining every day!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((match) => (
              <ProfileCard
                key={match.id}
                id={match.id}
                name={match.full_name}
                handle={match.instagram ? `@${match.instagram.replace("@", "")}` : ""}
                bio={match.bio}
                matchPercent={match.matchPercent}
                matchReasons={match.matchReasons}
                skills={match.skills}
                isNew={isNewMember(match.created_at)}
                initials={match.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                photoUrl={match.avatar_url || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default FirstMatches;
