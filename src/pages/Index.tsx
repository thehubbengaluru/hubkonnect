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
        {/* Background circles */}
        <ConcentricCircles className="absolute inset-0 w-full h-full text-primary pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background/80 to-background pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium font-accent">
            <Sparkles className="h-4 w-4" />
            The Hub Bengaluru
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight">
            Your next collaboration
            <br />
            <span className="text-accent">is already here</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect with the right people at The Hub. Get matched based on skills, interests, and goals — not chance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/auth">
              <Button size="lg" className="gap-2 rounded-button font-semibold px-8">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="rounded-button font-semibold px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Connecting the dots
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground border-t">
        <p>
          Built with ❤️ for{" "}
          <span className="font-accent font-semibold text-foreground">The Hub Bengaluru</span>{" "}
          community
        </p>
      </footer>
    </div>
  );
};

export default Index;
