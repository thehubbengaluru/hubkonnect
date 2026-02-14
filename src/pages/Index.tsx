import { Link } from "react-router-dom";
import { ArrowRight, Users, Sparkles, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConcentricCircles from "@/components/ConcentricCircles";

const features = [
  {
    icon: Sparkles,
    title: "Smart Matching",
    description: "Get matched with people who share your skills, interests, and goals.",
  },
  {
    icon: Users,
    title: "Living Directory",
    description: "Discover co-living residents, co-workers, and event attendees in one place.",
  },
  {
    icon: Handshake,
    title: "Intentional Connections",
    description: "Turn random encounters into meaningful collaborations that last.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 overflow-hidden">
        <ConcentricCircles className="absolute inset-0 w-full h-full text-foreground pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-block border-2 border-foreground bg-accent px-4 py-1.5 shadow-brutal-sm">
            <span className="text-sm font-mono font-bold uppercase tracking-wider">
              The Hub Bengaluru
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading uppercase leading-[0.9]">
            Your next
            <br />
            <span className="relative inline-block">
              collab
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-accent -z-10" />
            </span>
            {" "}is
            <br />
            already here
          </h1>

          <p className="text-lg font-mono text-muted-foreground max-w-lg mx-auto">
            Connect with the right people at The Hub. Matched by skills, interests, and goals — not chance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider px-8 h-14 text-base">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="border-2 border-foreground shadow-brutal-sm hover:bg-accent hover:shadow-brutal transition-all font-mono font-bold uppercase tracking-wider px-8 h-14 text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary border-t-2 border-foreground">
        <div className="container max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-heading uppercase text-center mb-16">
            Connecting<br />the dots
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`border-2 border-foreground p-6 shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${
                  i === 1 ? "bg-accent" : "bg-card"
                }`}
              >
                <div className="h-12 w-12 border-2 border-foreground flex items-center justify-center mb-4 bg-background">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl uppercase mb-3">{f.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-foreground text-primary-foreground py-16 px-4 border-t-2 border-foreground">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading uppercase">
            Stop networking by accident
          </h2>
          <p className="font-mono text-primary-foreground/70 max-w-md mx-auto">
            Join 200+ community members already making intentional connections.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent text-accent-foreground border-2 border-accent shadow-brutal-accent hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-mono font-bold uppercase tracking-wider px-10 h-14 text-base">
              Join the community
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t-2 border-foreground">
        <p className="font-mono text-sm text-muted-foreground">
          Built with ❤️ for{" "}
          <span className="font-bold text-foreground">The Hub Bengaluru</span>{" "}
          community
        </p>
      </footer>
    </div>
  );
};

export default Index;
