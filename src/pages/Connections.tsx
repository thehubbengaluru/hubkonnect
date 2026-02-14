import PageShell from "@/components/PageShell";

const Connections = () => {
  return (
    <PageShell>
      <div className="container py-10">
        <h1 className="text-4xl font-heading uppercase mb-2">Connections</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Manage your connection requests and see your network.
        </p>
        <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
          No connections yet — start matching!
        </div>
      </div>
    </PageShell>
  );
};

export default Connections;
