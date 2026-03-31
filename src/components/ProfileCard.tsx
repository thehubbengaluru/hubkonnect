import { useState, memo } from "react";
import { ArrowRight, Sparkles, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSendConnection } from "@/hooks/use-connections";
import { useToast } from "@/hooks/use-toast";
import ConnectDialog from "./ConnectDialog";

type ConnectionState = "none" | "sent" | "pending" | "connected";

interface ProfileCardProps {
  id?: string;
  name: string;
  handle: string;
  bio: string;
  matchPercent: number;
  skills: string[];
  /** Primary reason shown as the headline */
  matchReason?: string;
  /** All reasons — shown as expandable list */
  matchReasons?: string[];
  initials: string;
  photoUrl?: string;
  connectionStatus?: ConnectionState;
  isNew?: boolean;
}

const ProfileCard = ({
  id, name, handle, bio, matchPercent, skills,
  matchReason, matchReasons, initials, photoUrl,
  connectionStatus = "none", isNew = false,
}: ProfileCardProps) => {
  const sendConnection = useSendConnection();
  const { toast } = useToast();
  const [localSent, setLocalSent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [reasonsExpanded, setReasonsExpanded] = useState(false);
  const effectiveStatus: ConnectionState = localSent ? "sent" : connectionStatus;

  // Prefer the full reasons array; fall back to single reason string
  const reasons: string[] = matchReasons?.length
    ? matchReasons
    : matchReason
    ? [matchReason]
    : ["Hub community member"];

  const handleConnect = async (message: string) => {
    if (!id || effectiveStatus !== "none") return;
    try {
      await sendConnection.mutateAsync({ receiverId: id, message: message || undefined });
      setLocalSent(true);
      setDialogOpen(false);
      toast({ title: "Request sent!", description: `Connection request sent to ${name}.` });
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists")) {
        toast({ title: "Already sent", description: "You already have a pending request with this person." });
        setLocalSent(true);
      } else if (msg.includes("rate limit") || msg.includes("limit reached") || msg.includes("10/day")) {
        toast({ title: "Daily limit reached", description: "You've reached your daily connection limit (10/day). Try again tomorrow.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: msg || "Failed to send request.", variant: "destructive" });
      }
      setDialogOpen(false);
    }
  };

  const isLongBio = bio && bio.length > 120;

  return (
    <>
      <div className="border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col">
        <div className="p-6 flex-1 space-y-4">
          {/* Avatar row */}
          <div className="flex items-start justify-between gap-2">
            <div className="relative">
              <div className="h-16 w-16 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="font-heading text-lg">{initials}</span>
                )}
              </div>
              {isNew && (
                <span className="absolute -top-2 -right-2 font-mono text-[9px] font-bold uppercase tracking-wider bg-accent text-accent-foreground border-2 border-foreground px-1.5 py-0.5 leading-none">
                  New
                </span>
              )}
            </div>
            <span className="inline-flex items-center border-2 border-foreground bg-foreground text-background font-mono text-xs font-bold px-2 py-1 shrink-0">
              {matchPercent}% Match
            </span>
          </div>

          {/* Name */}
          <div>
            <h3 className="font-heading text-lg uppercase">{name}</h3>
            {handle && <p className="font-mono text-xs text-muted-foreground">{handle}</p>}
          </div>

          {/* Bio with expand */}
          <div>
            <p className={`font-mono text-sm text-muted-foreground leading-relaxed ${!bioExpanded && isLongBio ? "line-clamp-2" : ""}`}>
              {bio}
            </p>
            {isLongBio && (
              <button
                onClick={() => setBioExpanded((v) => !v)}
                className="mt-1 font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                {bioExpanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
              </button>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <span key={skill} className="inline-block font-mono text-xs px-2 py-0.5 border border-foreground bg-background">{skill}</span>
            ))}
            {skills.length > 3 && (
              <span className="font-mono text-xs text-muted-foreground px-2 py-0.5">+{skills.length - 3} more</span>
            )}
          </div>

          {/* Match reasons */}
          <div className="bg-accent/15 border-l-[3px] border-accent px-3 py-2">
            <p className="font-mono text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent shrink-0" />
              {reasons[0]}
            </p>
            {reasons.length > 1 && (
              <>
                {reasonsExpanded && (
                  <ul className="mt-2 space-y-1">
                    {reasons.slice(1).map((r) => (
                      <li key={r} className="font-mono text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-accent mt-0.5 shrink-0">+</span>{r}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setReasonsExpanded((v) => !v)}
                  className="mt-1.5 font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                >
                  {reasonsExpanded
                    ? <><ChevronUp className="h-3 w-3" /> Less</>
                    : <><ChevronDown className="h-3 w-3" /> +{reasons.length - 1} more reason{reasons.length > 2 ? "s" : ""}</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t-2 border-foreground p-4 space-y-2">
          {effectiveStatus === "pending" ? (
            <Link to="/connections">
              <Button className="w-full h-11 border-2 border-foreground bg-accent text-accent-foreground shadow-brutal-sm hover:shadow-brutal transition-all font-mono font-bold uppercase tracking-wider text-xs gap-1">
                <Clock className="h-3.5 w-3.5" /> Accept Request
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => effectiveStatus === "none" ? setDialogOpen(true) : undefined}
              disabled={effectiveStatus !== "none" || sendConnection.isPending}
              className="w-full h-11 border-2 border-foreground shadow-brutal-sm hover:shadow-brutal transition-all font-mono font-bold uppercase tracking-wider text-xs gap-1"
            >
              {effectiveStatus === "connected" ? <><Check className="h-3.5 w-3.5" /> Connected</> :
               effectiveStatus === "sent" ? <><Check className="h-3.5 w-3.5" /> Sent</> :
               sendConnection.isPending ? "Sending..." : <>Connect <ArrowRight className="h-3.5 w-3.5" /></>}
            </Button>
          )}
          {id && (
            <Link
              to={`/profile/${id}`}
              className="block w-full text-center font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors py-1"
            >
              View Profile
            </Link>
          )}
        </div>
      </div>

      <ConnectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetName={name}
        onSend={handleConnect}
        loading={sendConnection.isPending}
      />
    </>
  );
};

export default memo(ProfileCard);
