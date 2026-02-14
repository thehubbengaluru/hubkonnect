import PageShell from "@/components/PageShell";

const Profile = () => {
  return (
    <PageShell>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground mb-8">
          Edit your details and manage your account.
        </p>
        <div className="rounded-card border bg-card p-8 text-center text-muted-foreground shadow-card">
          Complete your profile setup to get started.
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
