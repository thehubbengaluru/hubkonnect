import { useState } from "react";
import { ArrowRight, Sparkles, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSendConnection } from "@/hooks/use-connections";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "none" | "sent" | "pending" | "connected";

interface ProfileCardProps {
  id?: string;
  name: string;
  handle: string;
  bio: string;
  matchPercent: number;
  skills: string[];
  matchReason: string;
  initials: string;
  photoUrl?: string;
  connectionStatus?: ConnectionState;
}

const ProfileCard = ({ id, name, handle, bio, matchPercent, skills, matchReason, initials, photoUrl, connectionStatus = "none" }: ProfileCardProps) => {
  const navigate = useNavigate();
  const sendConnection = useSendConnection();
  const { toast } = useToast();
  const [localSent, setLocalSent] = useState(false);
  const effectiveStatus: ConnectionState = localSent ? "sent" : connectionStatus;

  const handleConnect = async () => {
    if (!id || effectiveStatus !== "none") return;
    try {
      await sendConnection.mutateAsync({ receiverId: id });
      setLocalSent(true);
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
    }
  };

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col">
      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-16 w-16 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="font-heading text-lg">{initials}</span>
            )}
          </div>
          <span className="inline-flex items-center border-2 border-foreground bg-foreground text-background font-mono text-xs font-bold px-2 py-1">
            {matchPercent}% Match
          </span>
        </div>

        <div>
          <h3 className="font-heading text-lg uppercase">{name}</h3>
          {handle && <p className="font-mono text-xs text-muted-foreground">{handle}</p>}
        </div>

        <p className="font-mono text-sm text-muted-foreground leading-relaxed line-clamp-2">{bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="inline-block font-mono text-[11px] px-2 py-0.5 border border-foreground bg-background">{skill}</span>
          ))}
          {skills.length > 3 && (
            <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5">+{skills.length - 3} more</span>
          )}
        </div>

        <div className="bg-accent/15 border-l-[3px] border-accent px-3 py-2">
          <p className="font-mono text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            {matchReason}
          </p>
        </div>
      </div>

      <div className="border-t-2 border-foreground p-4 space-y-2">
        <Button
          onClick={handleConnect}
          disabled={effectiveStatus !== "none" || sendConnection.isPending}
          className="w-full h-11 border-2 border-foreground shadow-brutal-sm hover:shadow-brutal transition-all font-mono font-bold uppercase tracking-wider text-xs gap-1"
        >
          {effectiveStatus === "connected" ? <><Check className="h-3.5 w-3.5" /> Connected</> :
           effectiveStatus === "sent" ? <><Check className="h-3.5 w-3.5" /> Sent</> :
           effectiveStatus === "pending" ? <><Clock className="h-3.5 w-3.5" /> Pending</> :
           sendConnection.isPending ? "Sending..." : <>Connect <ArrowRight className="h-3.5 w-3.5" /></>}
        </Button>
        <button onClick={() => id && navigate(`/profile/${id}`)}
          className="w-full text-center font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors py-1">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
