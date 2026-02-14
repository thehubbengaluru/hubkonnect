import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name: string;
  handle: string;
  bio: string;
  matchPercent: number;
  skills: string[];
  matchReason: string;
  initials: string;
  photoUrl?: string;
}

const ProfileCard = ({ name, handle, bio, matchPercent, skills, matchReason, initials, photoUrl }: ProfileCardProps) => {
  return (
    <div className="border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col">
      <div className="p-6 flex-1 space-y-4">
        {/* Photo + match badge */}
        <div className="flex items-start justify-between">
          <div className="h-16 w-16 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-heading text-lg">{initials}</span>
            )}
          </div>
          <span className="inline-flex items-center border-2 border-foreground bg-foreground text-background font-mono text-xs font-bold px-2 py-1">
            {matchPercent}% Match
          </span>
        </div>

        {/* Name & handle */}
        <div>
          <h3 className="font-heading text-lg uppercase">{name}</h3>
          <p className="font-mono text-xs text-muted-foreground">{handle}</p>
        </div>

        {/* Bio */}
        <p className="font-mono text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {bio}
        </p>

        {/* Skill pills */}
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-block font-mono text-[11px] px-2 py-0.5 border border-foreground bg-background"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5">
              +{skills.length - 3} more
            </span>
          )}
        </div>

        {/* Match reason */}
        <div className="bg-accent/15 border-l-[3px] border-accent px-3 py-2">
          <p className="font-mono text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            {matchReason}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t-2 border-foreground p-4 space-y-2">
        <Button className="w-full h-11 border-2 border-foreground shadow-brutal-sm hover:shadow-brutal transition-all font-mono font-bold uppercase tracking-wider text-xs gap-1">
          Connect <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <button className="w-full text-center font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors py-1">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
