import { Link } from "react-router-dom";
import { ArrowRight, User, Users, Handshake, ChevronDown, Quote, Lock, Coffee, Repeat, Kanban, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import ConcentricCircles from "@/components/ConcentricCircles";
import thbLogo from "@/assets/thb-logo.png";
import { useBetaStats } from "@/hooks/use-beta-stats";

const MEMBER_GOAL = 100;

const steps = [
  {
    icon: User,
    title: "Create Your Profile",
    description: "Share your skills, interests, and what you're looking for in under 2 minutes — from co-founders and collaborators to clients and creative partners.",
  },
  {
    icon: Users,
    title: "Get Curated Matches",
    description: "Get a short list of members who share your goals and complement your skills, based on what you say you want — no awkward cold outreach, no endless scrolling.",
  },
  {
    icon: Handshake,
    title: "Connect & Start Building",
    description: "Send a message, set up a chat at The Hub, and start collaborating on projects that matter to you.",
  },
];

const testimonials = [
  {
    quote: "I met my video co-producer through Community Connector. We've already shipped 3 projects together. Total game changer for my documentary work.",
    name: "Riya Sharma",
    role: "Documentary Filmmaker",
    initials: "RS",
  },
  {
    quote: "Found a UI designer for my startup within a week. The matching is scarily accurate — saved me months of searching and random outreach.",
    name: "Arjun Mehta",
    role: "Startup Founder",
    initials: "AM",
  },
  {
    quote: "As someone new to Bengaluru, this platform helped me find my tribe at The Hub. Now I have 8 genuine connections I actually collaborate with.",
    name: "Priya Nair",
    role: "Marketing Manager",
    initials: "PN",
  },
];

const lockedFeatures = [
  { icon: Coffee, title: "Coffee Roulette", description: "Weekly random pairings with conversation starters and auto-scheduled meetups." },
  { icon: Repeat, title: "Skill Swaps", description: "Barter your skills directly — offer video editing, get copywriting in return." },
  { icon: Kanban, title: "Project Boards", description: "Post projects, list roles needed, let people apply with one click." },
  { icon: UsersRound, title: "Accountability Pods", description: "Join small groups with shared goals. Weekly check-ins for 6 weeks." },
];

const Index = () => {
  const { data: stats } = useBetaStats();
  const memberCount = stats?.totalMembers ?? 0;
  const connectionCount = stats?.totalConnections ?? 0;
  const progressPercent = Math.min(100, Math.round((memberCount / MEMBER_GOAL) * 100));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
        <div className="container flex h-[72px] md:h-20 items-center justify-between">
          <Link to="/" className="flex flex-col">
            <span className="font-heading text-base md:text-lg uppercase leading-tight">
              Community Connector
            </span>
            <span className="font-mono text-[10px] md:text-xs text-muted-foreground">by The Hub Bengaluru</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-mono text-xs md:text-sm uppercase tracking-wider border-2 border-transparent hover:border-foreground">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="font-mono text-xs md:text-sm uppercase tracking-wider border-2 border-foreground shadow-brutal-sm hover:shadow-brutal transition-all gap-1">
                Join the Beta <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 pt-20 overflow-hidden">
        <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 md:space-y-8">
          <Badge className="bg-accent text-accent-foreground border-2 border-foreground font-mono text-xs uppercase tracking-wider px-4 py-1.5 shadow-brutal-sm">
            🚀 Early Access Beta
          </Badge>

          <img src={thbLogo} alt="The Hub Bengaluru logo" className="h-24 md:h-32 mx-auto mb-2" />
          <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[72px] font-heading uppercase leading-[0.95]">
            Turn your community
            <br />
            into your{" "}
            <span className="relative inline-block">
              collaborators
              <span className="absolute -bottom-1.5 left-0 right-0 h-3 md:h-4 bg-accent -z-10" />
            </span>
          </h1>

          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Stop leaving connections to chance. Turn the people around you at The Hub into project partners who actually ship with you.
          </p>

          <p className="font-mono text-base md:text-lg text-foreground max-w-lg mx-auto leading-relaxed">
            Connect with creators, founders, and operators at The Hub Bengaluru.
            <br />
            See curated matches for your next project partner in under 5 minutes.
          </p>

          <div className="flex flex-col items-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider px-8 md:px-10 h-14 text-sm md:text-base">
                Join the Beta — It's Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <span className="font-mono text-xs text-muted-foreground">Limited early access · No credit card required</span>
            <Link to="/login" className="font-mono text-sm text-muted-foreground hover:text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors">
              Already a member? Log in
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Emotional bridge */}
      <section className="py-16 md:py-20 px-4 border-t-2 border-foreground bg-secondary">
        <div className="container max-w-3xl text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-heading uppercase">
            Stop networking by accident
          </h2>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            You did not join The Hub for random coffee chats that go nowhere.
            You joined to find people who get your ideas, share your ambition, and want to build with you.
          </p>
          <p className="font-mono text-sm md:text-base text-foreground font-bold max-w-lg mx-auto">
            Community Connector helps you connect with purpose — in minutes, not months.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-4 border-t-2 border-foreground">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-heading uppercase text-center mb-4">
            How It Works
          </h2>
          <p className="font-mono text-sm md:text-base text-muted-foreground text-center mb-16 max-w-lg mx-auto">
            From profile to project partner in three steps.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={`border-2 border-foreground p-6 md:p-8 text-center shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${
                  i === 1 ? "bg-accent" : "bg-card"
                }`}
              >
                <div className="h-16 w-16 border-2 border-foreground flex items-center justify-center mx-auto mb-6 bg-background">
                  <s.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="font-heading text-xl md:text-2xl uppercase mb-3">{s.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats — Live Beta Progress */}
      <section className="py-16 md:py-20 px-4 bg-foreground text-primary-foreground border-t-2 border-foreground">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-heading uppercase text-center mb-4">
            Beta Goal: {MEMBER_GOAL} Members
          </h2>
          <p className="font-mono text-sm text-primary-foreground/60 text-center mb-8">
            Join the founding community. Early members shape what gets built next.
          </p>

          <div className="max-w-md mx-auto mb-10">
            <div className="flex justify-between font-mono text-xs mb-2">
              <span>{memberCount} members joined</span>
              <span>{MEMBER_GOAL} goal</span>
            </div>
            <Progress value={progressPercent} className="h-4 border-2 border-primary-foreground/30 bg-primary-foreground/10" />
            <p className="font-mono text-xs text-primary-foreground/50 text-center mt-2">
              {progressPercent}% there — {MEMBER_GOAL - memberCount} spots to go
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-5xl font-heading">{memberCount}</div>
              <div className="font-mono text-xs md:text-sm text-primary-foreground/70 uppercase tracking-wider">Members</div>
              <p className="font-mono text-xs text-primary-foreground/50">Creators, founders, and operators</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-5xl font-heading">{connectionCount}</div>
              <div className="font-mono text-xs md:text-sm text-primary-foreground/70 uppercase tracking-wider">Connections Made</div>
              <p className="font-mono text-xs text-primary-foreground/50">Real collaborations, not just follows</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-5xl font-heading">{stats?.avgMatchRate ?? 0}%</div>
              <div className="font-mono text-xs md:text-sm text-primary-foreground/70 uppercase tracking-wider">Avg Match Rate</div>
              <p className="font-mono text-xs text-primary-foreground/50">Based on skills, interests & goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Unlocks at 100 Members */}
      <section className="py-20 md:py-28 px-4 border-t-2 border-foreground">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-heading uppercase text-center mb-4">
            What Unlocks at {MEMBER_GOAL} Members
          </h2>
          <p className="font-mono text-sm text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            These features activate when we hit our founding member goal. Join now to shape them.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lockedFeatures.map((f) => (
              <div
                key={f.title}
                className="border-2 border-foreground/30 bg-card p-6 text-center opacity-80 hover:opacity-100 transition-opacity relative"
              >
                <Lock className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
                <div className="h-12 w-12 border-2 border-foreground/30 flex items-center justify-center mx-auto mb-4 bg-secondary">
                  <f.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-lg uppercase mb-2">{f.title}</h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 md:py-28 px-4 bg-secondary border-t-2 border-foreground">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-heading uppercase text-center mb-2">
            What Early Testers Are Saying
          </h2>
          <p className="font-mono text-xs text-muted-foreground text-center mb-12">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">Beta testers</Badge>
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="border-2 border-foreground bg-background p-6 shadow-brutal flex flex-col"
              >
                <Quote className="h-6 w-6 text-accent mb-4" />
                <p className="font-mono text-sm italic leading-relaxed flex-1 mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 border-t-2 border-foreground pt-4">
                  <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center font-heading text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold">{t.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 bg-foreground text-primary-foreground border-t-2 border-foreground">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading uppercase">
            Your next collaborator is already at The Hub
          </h2>
          <p className="font-mono text-sm md:text-base text-primary-foreground/70 max-w-lg mx-auto leading-relaxed">
            Join {memberCount > 0 ? `${memberCount}` : "the first"} members using Community Connector to turn chance encounters at The Hub into real projects, products, and partnerships.
          </p>
          <p className="font-mono text-sm text-primary-foreground/50">
            Get your first curated matches in under 5 minutes — it's free for Hub members.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-accent text-accent-foreground border-2 border-accent shadow-brutal-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-mono font-bold uppercase tracking-wider px-10 h-14 text-base mt-4">
              Join the Beta — It's Free
            </Button>
          </Link>
          <p className="font-mono text-xs text-primary-foreground/40">Limited early access</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t-2 border-foreground">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Community Connector by <span className="font-bold text-foreground">The Hub Bengaluru</span>
          </p>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">About</a>
            <a href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground underline underline-offset-2">Contact</a>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 The Hub. Built with ❤️ in Bangalore.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
