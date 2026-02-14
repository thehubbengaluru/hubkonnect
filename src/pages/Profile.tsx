import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Sparkles, Handshake, Lightbulb, Briefcase,
  Instagram, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/PageShell";

const PROFILE = {
  name: "Arjun Mehta",
  handle: "@arjunbuilds",
  initials: "AM",
  matchPercent: 92,
  bio: "Product designer passionate about creating intuitive experiences. Currently building design systems at a fintech startup. Always up for coffee and brainstorming new ideas!",
  skills: ["UI/UX Design", "Graphic Design", "Figma", "Prototyping", "User Research"],
  interests: ["Photography", "Startups", "Music", "Travel"],
  lookingFor: [
    { id: "collaborators", label: "Collaborators", icon: Handshake },
    { id: "mentors", label: "Mentors", icon: Lightbulb },
    { id: "opportunities", label: "Opportunities", icon: Briefcase },
  ],
  matchReasons: [
    "Both looking for collaborators",
    "Shared skills: Design",
    "Shared interests: Startups, Photography",
    "Both Co-working members",
  ],
  instagram: "@arjunbuilds",
  linkedin: "linkedin.com/in/arjunmehta",
};

const Profile = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="min-h-screen">
        <div className="container pt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Matches
          </button>
        </div>

        <div className="mt-4 border-y-2 border-foreground bg-foreground h-48 relative" />

        <div className="container max-w-3xl -mt-16 relative z-10 pb-32">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 border-4 border-foreground bg-accent flex items-center justify-center shadow-brutal-lg">
              <span className="font-heading text-4xl">{PROFILE.initials}</span>
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <h1 className="font-heading text-3xl md:text-4xl uppercase">{PROFILE.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">{PROFILE.handle}</p>
            <div className="inline-flex items-center border-2 border-foreground bg-foreground text-primary-foreground font-mono text-xs font-bold px-3 py-1 shadow-brutal-sm">
              {PROFILE.matchPercent}% Match
            </div>
          </div>

          <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
            <p className="font-mono text-sm leading-relaxed text-center">{PROFILE.bio}</p>
          </div>

          <div className="border-2 border-foreground bg-accent/15 border-l-[4px] border-l-accent p-5 mb-6">
            <h3 className="font-heading text-sm uppercase flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" /> Why We Matched
            </h3>
            <ul className="space-y-1.5">
              {PROFILE.matchReasons.map((reason) => (
                <li key={reason} className="font-mono text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span> {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
              <h3 className="font-heading text-sm uppercase mb-3">Skills ({PROFILE.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {PROFILE.skills.map((skill) => (
                  <span key={skill} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-foreground bg-foreground text-primary-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
              <h3 className="font-heading text-sm uppercase mb-3">Interests ({PROFILE.interests.length})</h3>
              <div className="flex flex-wrap gap-2">
                {PROFILE.interests.map((interest) => (
                  <span key={interest} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-accent bg-accent text-accent-foreground">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
            <h3 className="font-heading text-sm uppercase mb-3">Looking For</h3>
            <div className="flex flex-wrap gap-2">
              {PROFILE.lookingFor.map(({ id, label, icon: Icon }) => (
                <span key={id} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-2 border-2 border-foreground bg-background">
                  <Icon className="h-4 w-4" /> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
            <h3 className="font-heading text-sm uppercase mb-3">Social Links</h3>
            <div className="flex gap-3">
              <a href={`https://instagram.com/${PROFILE.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={`https://${PROFILE.linkedin}`} target="_blank" rel="noopener noreferrer"
                className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-foreground p-4 md:pb-4 pb-20">
          <div className="container max-w-3xl flex gap-3">
            <Button className="flex-1 h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2">
              Send Connection Request <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex-1 h-14 border-2 border-foreground font-mono text-sm uppercase tracking-wider hover:bg-card">
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
