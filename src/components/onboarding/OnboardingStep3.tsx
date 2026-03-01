import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SKILLS_DATA, INTERESTS_DATA } from "@/lib/onboarding-data";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_SELECTIONS = 5;
const MIN_SELECTIONS = 3;

interface TagPickerProps {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  categories: Record<string, string[]>;
  selected: string[];
  onToggle: (item: string) => void;
  onAddCustom: (item: string) => void;
}

const TagPicker = ({ title, subtitle, searchPlaceholder, categories, selected, onToggle, onAddCustom }: TagPickerProps) => {
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [countPop, setCountPop] = useState(false);
  const prevCount = useRef(selected.length);

  // Animate count changes
  useEffect(() => {
    if (selected.length !== prevCount.current) {
      setCountPop(true);
      prevCount.current = selected.length;
      const t = setTimeout(() => setCountPop(false), 300);
      return () => clearTimeout(t);
    }
  }, [selected.length]);

  const handleToggle = (item: string) => {
    setLastToggled(item);
    onToggle(item);
    setTimeout(() => setLastToggled(null), 300);
  };

  const allItems = Object.values(categories).flat();
  const filteredCategories = search
    ? { "Search Results": allItems.filter((s) => s.toLowerCase().includes(search.toLowerCase())) }
    : categories;

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && trimmed.length <= 30 && !allItems.includes(trimmed) && !selected.includes(trimmed)) {
      onAddCustom(trimmed);
      setCustomInput("");
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl md:text-3xl uppercase">{title}</h2>
        <p className="font-mono text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="border-2 border-foreground bg-background font-mono h-12 pl-10"
        />
      </div>

      {/* Categories & Pills */}
      <div className="space-y-4">
        {Object.entries(filteredCategories).map(([category, items]) => (
          <div key={category}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item);
                const atLimit = selected.length >= MAX_SELECTIONS && !isSelected;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => !atLimit && handleToggle(item)}
                    disabled={atLimit}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-mono border-2 transition-all ${
                      lastToggled === item ? "animate-pill-bounce" : ""
                    } ${
                      isSelected
                        ? "border-foreground bg-foreground text-background shadow-brutal-sm -translate-x-px -translate-y-px"
                        : atLimit
                        ? "border-muted text-muted-foreground cursor-not-allowed opacity-50"
                        : "border-foreground bg-background text-foreground hover:bg-accent hover:shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px"
                    }`}
                  >
                    {isSelected && "✓ "}{item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add custom */}
      {showCustom ? (
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type custom skill..."
            maxLength={30}
            className="border-2 border-foreground bg-background font-mono h-10"
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim()}
            className="h-10 border-2 border-foreground font-mono text-xs uppercase"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setShowCustom(false); setCustomInput(""); }}
            className="h-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Add custom
        </button>
      )}

      {/* Selected container */}
      {selected.length > 0 && (
        <div className="border-2 border-foreground bg-card p-4 space-y-2">
          <p className="font-mono text-xs font-bold uppercase tracking-wider">
            Selected (<span className={countPop ? "animate-count-pop inline-block" : "inline-block"}>{selected.length}</span>/{MAX_SELECTIONS})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-mono bg-foreground text-background border-2 border-foreground"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  className="hover:text-destructive transition-colors ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OnboardingStep3 = ({ data, updateData, onNext, onBack }: Props) => {
  const toggleSkill = (skill: string) => {
    const current = data.skills || [];
    if (current.includes(skill)) {
      updateData({ skills: current.filter((s) => s !== skill) });
    } else if (current.length < MAX_SELECTIONS) {
      updateData({ skills: [...current, skill] });
    }
  };

  const toggleInterest = (interest: string) => {
    const current = data.interests || [];
    if (current.includes(interest)) {
      updateData({ interests: current.filter((i) => i !== interest) });
    } else if (current.length < MAX_SELECTIONS) {
      updateData({ interests: [...current, interest] });
    }
  };

  const skills = data.skills || [];
  const interests = data.interests || [];
  const canNext = skills.length >= MIN_SELECTIONS && interests.length >= MIN_SELECTIONS;

  return (
    <div className="space-y-12">
      {/* Encouragement nudge */}
      <div className="text-center">
        <p className="font-mono text-xs text-accent font-bold">
          💡 People with 5+ skills get 3x more connections
        </p>
      </div>

      <TagPicker
        title="What are you skilled at?"
        subtitle={`Select ${MIN_SELECTIONS}-${MAX_SELECTIONS} skills to help others find you`}
        searchPlaceholder="Search skills..."
        categories={SKILLS_DATA}
        selected={skills}
        onToggle={toggleSkill}
        onAddCustom={(s) => updateData({ skills: [...skills, s] })}
      />

      <div className="border-t-2 border-foreground" />

      <TagPicker
        title="What are you interested in?"
        subtitle={`Select ${MIN_SELECTIONS}-${MAX_SELECTIONS} interests to find like-minded people`}
        searchPlaceholder="Search interests..."
        categories={INTERESTS_DATA}
        selected={interests}
        onToggle={toggleInterest}
        onAddCustom={(i) => updateData({ interests: [...interests, i] })}
      />

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
          disabled={!canNext}
          className="h-12 sm:h-14 px-5 sm:px-8 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-xs sm:text-sm gap-2"
        >
          <span className="hidden sm:inline">Next: Looking For</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
