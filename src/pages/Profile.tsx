import PageShell from "@/components/PageShell";

const Profile = () => {
  return (
    <PageShell>
      <div className="container py-10">
        <h1 className="text-4xl font-heading uppercase mb-2">Your Profile</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Edit your details and manage your account.
        </p>
        <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
          Complete your profile setup to get started.
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
