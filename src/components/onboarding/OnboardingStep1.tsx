import { useRef } from "react";
import { Camera, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onSkip: () => void;
}

const LivePreview = ({ data }: { data: OnboardingData }) => (
  <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm space-y-3">
    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      Live Preview
    </p>
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 border-2 border-foreground bg-background flex-shrink-0 flex items-center justify-center overflow-hidden">
        {data.photoPreview ? (
          <img src={data.photoPreview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-heading text-base uppercase truncate">
          {data.fullName || "Your Name"}
        </h3>
        <p className="font-mono text-xs text-muted-foreground line-clamp-2">
          {data.bio || "Your bio will appear here..."}
        </p>
        {data.instagram && (
          <p className="font-mono text-[10px] text-accent truncate">{data.instagram}</p>
        )}
      </div>
    </div>
  </div>
);

const OnboardingStep1 = ({ data, updateData, onNext, onSkip }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    updateData({ photoFile: file, photoPreview: URL.createObjectURL(file) });
  };

  const bioLength = data.bio.length;
  const bioColor = bioLength > 150 ? "text-destructive" : bioLength > 140 ? "text-accent" : "text-muted-foreground";
  const bioPercent = Math.min((bioLength / 150) * 100, 100);

  const canNext = data.fullName.trim() && data.bio.trim() && bioLength <= 150;

  const formContent = (
    <div className="space-y-8 flex-1">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl uppercase">Let's set up your profile</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Help others discover you by sharing a bit about yourself
        </p>
      </div>

      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="h-28 w-28 border-2 border-dashed border-foreground bg-card flex items-center justify-center hover:bg-accent/20 transition-colors overflow-hidden"
        >
          {data.photoPreview ? (
            <img src={data.photoPreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-muted-foreground" />
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handlePhoto} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="font-mono text-xs underline decoration-accent decoration-2 underline-offset-2 text-muted-foreground hover:text-foreground"
        >
          {data.photoPreview ? "Change photo" : "Add profile photo"}
        </button>
        <span className="font-mono text-[10px] text-muted-foreground">(Optional — skip for now)</span>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs font-bold uppercase tracking-wider">
            Full Name <span className="text-accent">*</span>
          </Label>
          <Input
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Riya Sharma"
            className="border-2 border-foreground bg-background font-mono h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs font-bold uppercase tracking-wider">
            Bio (150 characters) <span className="text-accent">*</span>
          </Label>
          <Textarea
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder="Documentary filmmaker looking for creative collaborators..."
            className="border-2 border-foreground bg-background font-mono resize-y min-h-[96px]"
            maxLength={160}
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted border border-foreground/20 overflow-hidden">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${bioPercent}%`,
                  backgroundColor: bioLength > 150 ? "hsl(var(--destructive))" : bioLength > 140 ? "hsl(var(--accent))" : "hsl(var(--foreground))",
                }}
              />
            </div>
            <p className={`font-mono text-[11px] ${bioColor}`}>{bioLength}/150</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs font-bold uppercase tracking-wider">
            Instagram Handle <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            value={data.instagram}
            onChange={(e) => updateData({ instagram: e.target.value })}
            placeholder="@riyacreates"
            className="border-2 border-foreground bg-background font-mono h-12"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-mono text-xs font-bold uppercase tracking-wider">
            LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            value={data.linkedin}
            onChange={(e) => updateData({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/riyasharma"
            className="border-2 border-foreground bg-background font-mono h-12"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="font-mono text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Skip for now
        </button>
        <Button
          onClick={onNext}
          disabled={!canNext}
          className="h-14 px-8 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2"
        >
          Next: Member Type <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={isMobile ? "space-y-6" : "flex gap-8 items-start"}>
      {formContent}
      <div className={isMobile ? "" : "w-72 flex-shrink-0 sticky top-36"}>
        <LivePreview data={data} />
      </div>
    </div>
  );
};

export default OnboardingStep1;
