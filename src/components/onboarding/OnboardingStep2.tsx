import { Home, Briefcase, CalendarDays, Instagram, ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const memberTypes = [
  { id: "co_living", icon: Home, title: "Co-living", description: "I live at The Hub" },
  { id: "co_working", icon: Briefcase, title: "Co-working", description: "I work at The Hub" },
  { id: "event_attendee", icon: CalendarDays, title: "Event Attendee", description: "I attend Hub events" },
  { id: "follower", icon: Instagram, title: "Follower", description: "I follow The Hub" },
];

const OnboardingStep2 = ({ data, updateData, onNext, onBack }: Props) => {
  const toggle = (id: string) => {
    const current = data.memberTypes;
    if (current.includes(id)) {
      updateData({ memberTypes: current.filter((t) => t !== id) });
    } else {
      updateData({ memberTypes: [...current, id] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl uppercase">How are you part of The Hub?</h1>
        <p className="font-mono text-sm text-muted-foreground">
          This helps us suggest the most relevant connections
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {memberTypes.map(({ id, icon: Icon, title, description }) => {
          const selected = data.memberTypes.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`relative border-2 border-foreground p-6 text-center transition-all text-left ${
                selected
                  ? "bg-accent shadow-brutal-sm -translate-x-0.5 -translate-y-0.5 animate-pill-bounce"
                  : "bg-card hover:bg-accent/10 shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5"
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 h-6 w-6 border-2 border-foreground bg-foreground flex items-center justify-center">
                  <Check className="h-4 w-4 text-background" />
                </div>
              )}
              <div className="h-14 w-14 border-2 border-foreground flex items-center justify-center mb-4 bg-background">
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="font-heading text-lg uppercase mb-1">{title}</h3>
              <p className="font-mono text-xs text-muted-foreground">{description}</p>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-center justify-center gap-2 font-mono text-xs text-info bg-info/10 border border-info/30 px-4 py-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        You can select multiple if applicable
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
          onClick={onNext}
          disabled={data.memberTypes.length === 0}
          className="h-12 sm:h-14 px-5 sm:px-8 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-xs sm:text-sm gap-2"
        >
          <span className="hidden sm:inline">Next: Add Skills</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
