import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/PageShell";
import ProfileCard from "@/components/ProfileCard";

const MOCK_MATCHES = [
  {
    id: "1",
    name: "Arjun Mehta",
    handle: "@arjunbuilds",
    bio: "Product designer passionate about fintech and user-first experiences.",
    matchPercent: 92,
    skills: ["UI/UX Design", "Figma", "Startup"],
    matchReason: "Shared: Photography • Both looking for collaborators",
    initials: "AM",
  },
  {
    id: "2",
    name: "Priya Nair",
    handle: "@priyaframes",
    bio: "Photographer capturing stories through documentary and street photography.",
    matchPercent: 88,
    skills: ["Photography", "Travel", "Film"],
    matchReason: "Shared: Photography, Travel",
    initials: "PN",
  },
  {
    id: "3",
    name: "Karan Singh",
    handle: "@karanvibes",
    bio: "Brand strategist helping early-stage startups find their voice.",
    matchPercent: 85,
    skills: ["Marketing", "Strategy", "Branding"],
    matchReason: "Looking for collaborators",
    initials: "KS",
  },
  {
    id: "4",
    name: "Meera Joshi",
    handle: "@meeracodes",
    bio: "Full-stack developer building tools for the creator economy.",
    matchPercent: 82,
    skills: ["React", "Node.js", "AI/ML"],
    matchReason: "Shared: Coding, Startups",
    initials: "MJ",
  },
  {
    id: "5",
    name: "Rohan Das",
    handle: "@rohandas",
    bio: "Content creator specializing in short-form video and motion graphics.",
    matchPercent: 80,
    skills: ["Video Editing", "Motion Graphics"],
    matchReason: "Both looking for feedback",
    initials: "RD",
  },
  {
    id: "6",
    name: "Ananya Rao",
    handle: "@ananyawrites",
    bio: "Copywriter and podcaster exploring stories at the intersection of tech and culture.",
    matchPercent: 78,
    skills: ["Writing", "Podcasting", "Social Media"],
    matchReason: "Shared: Writing, Social Impact",
    initials: "AR",
  },
];

const FirstMatches = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sortBy, setSortBy] = useState("best");
  const [filterType, setFilterType] = useState("all");

  return (
    <PageShell>
      <div className="container py-8">
        {/* Welcome banner */}
        {bannerVisible && (
          <div className="relative border-2 border-foreground bg-foreground text-primary-foreground p-6 md:p-8 mb-8 shadow-brutal">
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute top-3 right-3 text-primary-foreground/60 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-2xl md:text-3xl uppercase mb-2">
              Welcome to Community Connector! 👋
            </h2>
            <p className="font-mono text-sm text-primary-foreground/70 max-w-xl">
              Here are {MOCK_MATCHES.length} people we think you'll vibe with based on your skills, interests, and what you're looking for.
            </p>
          </div>
        )}

        {/* Header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl uppercase">Your Matches</h2>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="best">Best Match</option>
              <option value="recent">Recent</option>
              <option value="active">Most Active</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border-2 border-foreground bg-background font-mono text-xs uppercase tracking-wider px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Types</option>
              <option value="co_living">Co-living</option>
              <option value="co_working">Co-working</option>
              <option value="event">Event Attendees</option>
            </select>
          </div>
        </div>

        {/* Profile cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_MATCHES.map((match) => (
            <ProfileCard key={match.id} {...match} />
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default FirstMatches;
