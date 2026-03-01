import { Printer, ArrowRight, Users, Shield, Zap, Target, MessageSquare, BarChart3, Calendar, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import thbLogo from "@/assets/thb-logo.png";

const Slide = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 md:px-12 lg:px-24 pitch-slide ${className}`}>
    {children}
  </section>
);

const Pitch = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Print button - hidden in print */}
      <div className="fixed top-6 right-6 z-50 print:hidden">
        <Button
          onClick={() => window.print()}
          className="gap-2 border-2 border-foreground shadow-brutal font-mono text-xs uppercase tracking-wider"
        >
          <Printer className="h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      {/* Slide 1: Title */}
      <Slide>
        <div className="flex flex-col items-center gap-8 text-center max-w-3xl">
          <img src={thbLogo} alt="The Hub Bengaluru" className="h-20 w-auto" />
          <div className="border-4 border-foreground p-8 md:p-12 shadow-brutal-lg bg-card">
            <h1 className="text-4xl md:text-6xl lg:text-7xl leading-tight">
               Hub Konnect
            </h1>
            <div className="h-1 w-24 bg-accent mx-auto my-6" />
            <p className="font-mono text-lg md:text-xl text-muted-foreground">
              Turn your community into your collaborators
            </p>
          </div>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
            A proposal for The Hub Bengaluru
          </p>
        </div>
      </Slide>

      {/* Slide 2: The Problem */}
      <Slide className="bg-card">
        <div className="max-w-3xl w-full">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">The Problem</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            Networking happens by accident
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: "🎲", title: "Random encounters", desc: "Members rely on hallway bumps and chance meetings to make connections" },
              { icon: "🔍", title: "Hidden talent", desc: "No structured way to discover complementary skills within the community" },
              { icon: "⏳", title: "Slow growth", desc: "Meaningful connections form slowly — if they form at all" },
            ].map((item) => (
              <div key={item.title} className="border-2 border-foreground p-6 shadow-brutal bg-background">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg mb-2">{item.title}</h3>
                <p className="font-mono text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 3: The Solution */}
      <Slide>
        <div className="max-w-3xl w-full">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">The Solution</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            Intentional, data-driven matching
          </h2>
          <div className="space-y-6">
            {[
              { icon: Target, title: "Smart matching", desc: "Algorithm compares skills, interests, and intent to surface the most relevant connections with match percentages" },
              { icon: Shield, title: "Privacy-first", desc: "Social handles (Instagram, LinkedIn) stay hidden until both members connect — no unsolicited DMs" },
              { icon: Zap, title: "Quality over quantity", desc: "10 connection requests per day keeps interactions intentional and prevents spam" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-6 items-start border-2 border-foreground p-6 shadow-brutal-sm bg-card">
                <div className="h-12 w-12 border-2 border-foreground bg-accent flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">{title}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 4: How It Works */}
      <Slide className="bg-card">
        <div className="max-w-3xl w-full">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">How It Works</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            Three simple steps
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Create Profile", desc: "Add your skills, interests, what you're looking for, and your member type" },
              { step: "02", title: "Get Matched", desc: "Our algorithm finds your most compatible community members with match scores" },
              { step: "03", title: "Connect", desc: "Send a request, share a message, and unlock each other's social profiles" },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="border-2 border-foreground p-6 shadow-brutal bg-background">
                  <span className="font-heading text-4xl text-accent block mb-4">{item.step}</span>
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 5: Key Features */}
      <Slide>
        <div className="max-w-3xl w-full">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">Key Features</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            Built for community
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Target, label: "Smart Matching", desc: "Multi-dimensional algorithm across skills, interests & goals" },
              { icon: Users, label: "Connection Management", desc: "Track pending, accepted & manage your network" },
              { icon: Shield, label: "Privacy Controls", desc: "Choose what's visible — socials unlock on connect" },
              { icon: Zap, label: "Community-First Design", desc: "Neo-brutalist aesthetic that feels like a physical space" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="border-2 border-foreground p-5 shadow-brutal-sm bg-card flex gap-4 items-start">
                <Icon className="h-5 w-5 text-accent mt-1 shrink-0" />
                <div>
                  <h3 className="text-base mb-1">{label}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 6: Community Impact */}
      <Slide className="bg-card">
        <div className="max-w-3xl w-full text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">Community Impact</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            The numbers speak
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { stat: "500+", label: "Community Members" },
              { stat: "120+", label: "Connections Made" },
              { stat: "85%", label: "Match Satisfaction" },
            ].map(({ stat, label }) => (
              <div key={label} className="border-4 border-foreground p-8 shadow-brutal-lg bg-background">
                <span className="font-heading text-5xl md:text-6xl text-accent block mb-2">{stat}</span>
                <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 7: What's Next */}
      <Slide>
        <div className="max-w-3xl w-full">
          <p className="font-mono text-sm uppercase tracking-widest text-accent mb-4">Roadmap</p>
          <h2 className="text-3xl md:text-5xl mb-12">
            What's next
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: MessageSquare, label: "Real-time Messaging", desc: "Chat with connections directly in the app" },
              { icon: BarChart3, label: "Admin Analytics", desc: "Dashboard with community insights, skill trends & engagement" },
              { icon: Calendar, label: "Event-Based Matching", desc: "Surface relevant connections before Hub events" },
              { icon: Lightbulb, label: "Community Insights", desc: "Identify skill gaps and trending interests across the community" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="border-2 border-dashed border-foreground p-5 flex gap-4 items-start">
                <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <h3 className="text-base mb-1">{label}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* Slide 8: CTA */}
      <Slide className="bg-foreground text-primary-foreground">
        <div className="max-w-3xl w-full text-center">
          <h2 className="text-3xl md:text-5xl mb-6" style={{ color: "hsl(var(--accent))" }}>
            Let's launch this at The Hub
          </h2>
          <p className="font-mono text-lg mb-10 opacity-80">
            Hub Konnect turns The Hub from a place people work <em>at</em> into a community people build <em>with</em>.
          </p>
          <a href="/" className="print:hidden">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground border-2 border-accent shadow-brutal-accent font-mono text-sm uppercase tracking-wider hover:bg-accent/90 px-10 py-6 text-base"
            >
              View the Live App <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </a>
          <p className="font-mono text-xs mt-8 opacity-50 uppercase tracking-widest">
            Built with ♥ for The Hub Bengaluru
          </p>
        </div>
      </Slide>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .pitch-slide {
            min-height: 100vh;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .pitch-slide:last-child {
            page-break-after: auto;
          }
          .shadow-brutal, .shadow-brutal-sm, .shadow-brutal-lg, .shadow-brutal-accent {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Pitch;
