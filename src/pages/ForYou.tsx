import PageShell from "@/components/PageShell";
import ConcentricCircles from "@/components/ConcentricCircles";

const ForYou = () => {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <ConcentricCircles className="absolute -top-32 -right-32 w-96 h-96 text-teal pointer-events-none opacity-20" />
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-2">For You</h1>
          <p className="text-muted-foreground mb-8">
            Your top matches based on skills, interests, and goals.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Profile cards will go here */}
            <div className="rounded-card border bg-card p-8 text-center text-muted-foreground shadow-card">
              Complete your profile to see matches
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ForYou;
