import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Sparkles, Handshake, Lightbulb, Briefcase,
  Instagram, Linkedin, Heart, MessageCircle, Rocket, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileById, useMyProfileDetails, computeMatch } from "@/hooks/use-profiles";
import { useAuth } from "@/contexts/AuthContext";
import { useSendConnection, useConnectionStatus } from "@/hooks/use-connections";
import { useToast } from "@/hooks/use-toast";
import { LOOKING_FOR_OPTIONS } from "@/lib/onboarding-data";

const LOOKING_FOR_ICONS: Record<string, React.ElementType> = {
  Handshake, Lightbulb, Briefcase, Heart, MessageCircle, Rocket, GraduationCap,
};

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfileById(id);
  const { data: myProfile } = useMyProfileDetails(user?.id);
  const sendConn = useSendConnection();
  const { data: connStatus } = useConnectionStatus(user?.id, id);

  if (isLoading) {
    return (
      <PageShell>
        <div className="container max-w-3xl py-8 space-y-6">
          <Skeleton className="h-48 border-2 border-foreground" />
          <div className="flex justify-center -mt-16 relative z-10">
            <Skeleton className="h-32 w-32 border-2 border-foreground" />
          </div>
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-24 border-2 border-foreground" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 border-2 border-foreground" />
            <Skeleton className="h-32 border-2 border-foreground" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <div className="container max-w-3xl py-8">
          <div className="border-2 border-foreground bg-card p-8 text-center font-mono text-sm text-muted-foreground shadow-brutal">
            Profile not found
          </div>
        </div>
      </PageShell>
    );
  }

  const initials = profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const match = myProfile ? computeMatch(myProfile, profile) : null;

  const handleConnect = async () => {
    try {
      await sendConn.mutateAsync({ receiverId: profile.id });
      toast({ title: "Connection request sent!" });
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("rate limit") || msg.includes("limit reached") || msg.includes("10/day")) {
        toast({ title: "Daily limit reached", description: "You've reached your daily connection limit (10/day). Try again tomorrow.", variant: "destructive" });
      } else if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists")) {
        toast({ title: "Already sent", description: "A connection request already exists." });
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    }
  };

  const isOwner = user?.id === profile.id;
  const isConnected = connStatus?.status === "accepted";
  const hasPending = connStatus?.status === "pending";
  const showSocialLinks = isOwner || isConnected;

  return (
    <PageShell>
      <div className="min-h-screen">
        <div className="container pt-4">
          <button onClick={() => navigate("/for-you")}
            className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="mt-4 border-y-2 border-foreground bg-foreground h-48 relative" />

        <div className="container max-w-3xl -mt-16 relative z-10 pb-32">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 border-4 border-foreground bg-accent flex items-center justify-center shadow-brutal-lg overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="font-heading text-4xl">{initials}</span>
              )}
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <h1 className="font-heading text-3xl md:text-4xl uppercase">{profile.full_name}</h1>
            {showSocialLinks && profile.instagram && <p className="font-mono text-sm text-muted-foreground">@{profile.instagram.replace("@", "")}</p>}
            {match && (
              <div className="inline-flex items-center border-2 border-foreground bg-foreground text-primary-foreground font-mono text-xs font-bold px-3 py-1 shadow-brutal-sm">
                {match.percent}% Match
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
              <p className="font-mono text-sm leading-relaxed text-center">{profile.bio}</p>
            </div>
          )}

          {match && match.reasons.length > 0 && (
            <div className="border-2 border-foreground bg-accent/15 border-l-[4px] border-l-accent p-5 mb-6">
              <h3 className="font-heading text-sm uppercase flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-accent" /> Why We Matched
              </h3>
              <ul className="space-y-1.5">
                {match.reasons.map((reason) => (
                  <li key={reason} className="font-mono text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {profile.skills.length > 0 && (
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Skills ({profile.skills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-foreground bg-foreground text-primary-foreground">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.interests.length > 0 && (
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Interests ({profile.interests.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-accent bg-accent text-accent-foreground">{interest}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {profile.looking_for.length > 0 && (
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
              <h3 className="font-heading text-sm uppercase mb-3">Looking For</h3>
              <div className="flex flex-wrap gap-2">
                {profile.looking_for.map((id) => {
                  const opt = LOOKING_FOR_OPTIONS.find((o) => o.id === id);
                  const Icon = opt ? (LOOKING_FOR_ICONS[opt.icon] || Handshake) : Handshake;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-2 border-2 border-foreground bg-background">
                      <Icon className="h-4 w-4" /> {opt?.title ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {showSocialLinks && (profile.instagram || profile.linkedin) && (
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal mb-6">
              <h3 className="font-heading text-sm uppercase mb-3">Social Links</h3>
              <div className="flex gap-3">
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedin && /^(www\.)?linkedin\.com\//.test(profile.linkedin) && (
                  <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                    className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {!isOwner && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t-2 border-foreground p-4 md:pb-4 pb-[5.5rem]">
          <div className="container max-w-3xl flex gap-2 sm:gap-3">
              {isConnected ? (
                <Button disabled className="flex-1 h-12 sm:h-14 border-2 border-foreground font-mono font-bold uppercase tracking-wider text-xs sm:text-sm gap-2">
                  Connected ✓
                </Button>
              ) : hasPending ? (
                <Button disabled className="flex-1 h-12 sm:h-14 border-2 border-foreground font-mono font-bold uppercase tracking-wider text-xs sm:text-sm gap-2">
                  Pending
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={sendConn.isPending}
                  className="flex-1 h-12 sm:h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-xs sm:text-sm gap-2">
                  <span className="hidden sm:inline">Send Connection Request</span>
                  <span className="sm:hidden">Connect</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/for-you")}
                className="flex-1 h-12 sm:h-14 border-2 border-foreground font-mono text-xs sm:text-sm uppercase tracking-wider hover:bg-card">
                <span className="hidden sm:inline">Maybe Later</span>
                <span className="sm:hidden">Later</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Profile;
