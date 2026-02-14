import PageShell from "@/components/PageShell";

const Connections = () => {
  return (
    <PageShell>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Connections</h1>
        <p className="text-muted-foreground mb-8">
          Manage your connection requests and see your network.
        </p>
        <div className="rounded-card border bg-card p-8 text-center text-muted-foreground shadow-card">
          No connections yet — start matching!
        </div>
      </div>
    </PageShell>
  );
};

export default Connections;
