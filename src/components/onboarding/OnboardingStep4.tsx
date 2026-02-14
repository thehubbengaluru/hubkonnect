import { Handshake, Lightbulb, Briefcase, Heart, MessageCircle, Rocket, GraduationCap, ArrowLeft, Sparkles, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOOKING_FOR_OPTIONS } from "@/lib/onboarding-data";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Handshake, Lightbulb, Briefcase, Heart, MessageCircle, Rocket, GraduationCap,
};

const OnboardingStep4 = ({ data, updateData, onComplete, onBack }: Props) => {
  const lookingFor = data.lookingFor || [];

  const toggle = (id: string) => {
    if (lookingFor.includes(id)) {
      updateData({ lookingFor: lookingFor.filter((l) => l !== id) });
    } else {
      updateData({ lookingFor: [...lookingFor, id] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl uppercase">
          What are you hoping to find?
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          This helps us match you with people who can help you grow
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LOOKING_FOR_OPTIONS.map(({ id, title, description, icon }) => {
          const selected = lookingFor.includes(id);
          const Icon = iconMap[icon] || Handshake;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`relative border-2 border-foreground p-5 text-left transition-all ${
                selected
                  ? "bg-accent shadow-brutal-sm -translate-x-0.5 -translate-y-0.5"
                  : "bg-card hover:bg-accent/10 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5"
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 h-6 w-6 border-2 border-foreground bg-foreground flex items-center justify-center">
                  <Check className="h-4 w-4 text-background" />
                </div>
              )}
              <div className="h-12 w-12 border-2 border-foreground flex items-center justify-center mb-3 bg-background">
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <h3 className="font-heading text-base uppercase mb-1">{title}</h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">{description}</p>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-center justify-center gap-2 font-mono text-xs text-info bg-info/10 border border-info/30 px-4 py-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        Select all that apply — no limits!
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button
          onClick={onComplete}
          disabled={lookingFor.length === 0}
          className="h-14 px-8 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Complete Profile & See Matches
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep4;
