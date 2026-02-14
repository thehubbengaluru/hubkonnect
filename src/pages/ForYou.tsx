import { useState } from "react";
import { Search, ChevronDown, ArrowRight, Calendar, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageShell from "@/components/PageShell";
import ProfileCard from "@/components/ProfileCard";
import ConcentricCircles from "@/components/ConcentricCircles";

const FILTER_PILLS = ["All", "Co-living", "Co-working", "Events", "Followers"];

const MOCK_MATCHES = [
  {
    id: "1", name: "Arjun Mehta", handle: "@arjunbuilds",
    bio: "Product designer passionate about fintech and user-first experiences.",
    matchPercent: 92, skills: ["UI/UX Design", "Figma", "Startup"],
    matchReason: "Shared: Photography • Both looking for collaborators", initials: "AM",
  },
  {
    id: "2", name: "Priya Nair", handle: "@priyaframes",
    bio: "Photographer capturing stories through documentary and street photography.",
    matchPercent: 88, skills: ["Photography", "Travel", "Film"],
    matchReason: "Shared: Photography, Travel", initials: "PN",
  },
  {
    id: "3", name: "Karan Singh", handle: "@karanvibes",
    bio: "Brand strategist helping early-stage startups find their voice.",
    matchPercent: 85, skills: ["Marketing", "Strategy", "Branding"],
    matchReason: "Looking for collaborators", initials: "KS",
  },
  {
    id: "4", name: "Meera Joshi", handle: "@meeracodes",
    bio: "Full-stack developer building tools for the creator economy.",
    matchPercent: 82, skills: ["React", "Node.js", "AI/ML"],
    matchReason: "Shared: Coding, Startups", initials: "MJ",
  },
  {
    id: "5", name: "Rohan Das", handle: "@rohandas",
    bio: "Content creator specializing in short-form video and motion graphics.",
    matchPercent: 80, skills: ["Video Editing", "Motion Graphics"],
    matchReason: "Both looking for feedback", initials: "RD",
  },
  {
    id: "6", name: "Ananya Rao", handle: "@ananyawrites",
    bio: "Copywriter and podcaster exploring stories at the intersection of tech and culture.",
    matchPercent: 78, skills: ["Writing", "Podcasting", "Social Media"],
    matchReason: "Shared: Writing, Social Impact", initials: "AR",
  },
];

const ACTIVE_USERS = [
  { name: "Arjun M.", initials: "AM" },
  { name: "Priya N.", initials: "PN" },
  { name: "Karan S.", initials: "KS" },
  { name: "Meera J.", initials: "MJ" },
  { name: "Sneha D.", initials: "SD" },
];

const ForYou = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("best");
  const [visibleCount, setVisibleCount] = useState(6);

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
              <div className="grid gap-6 md:grid-cols-2">
                {MOCK_MATCHES.slice(0, visibleCount).map((match) => (
                  <ProfileCard key={match.id} {...match} />
                ))}
              </div>

              {/* Load more */}
              {visibleCount < MOCK_MATCHES.length && (
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
                    <p className="font-heading text-2xl">12</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Total Matches</p>
                  </div>
                  <div className="border-l-2 border-r-2 border-foreground">
                    <p className="font-heading text-2xl">3</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">This Week</p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl">85%</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Match Rate</p>
                  </div>
                </div>
              </div>

              {/* Active now */}
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Active Now</h3>
                <div className="space-y-3">
                  {ACTIVE_USERS.map((user) => (
                    <div key={user.name} className="flex items-center gap-3 group cursor-pointer">
                      <div className="relative">
                        <div className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center">
                          <span className="font-mono text-[10px] font-bold">{user.initials}</span>
                        </div>
                        <div className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 bg-success border border-background rounded-full" />
                      </div>
                      <span className="font-mono text-sm group-hover:underline decoration-accent decoration-2 underline-offset-2">
                        {user.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors">
                  View All Members →
                </button>
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
                  <div className="border-l-[3px] border-accent bg-accent/10 px-3 py-2">
                    <p className="font-mono text-sm font-bold flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5" /> Design Workshop
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">Saturday, 3 PM</p>
                  </div>
                </div>
                <button className="mt-4 font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors">
                  See all events →
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ForYou;
