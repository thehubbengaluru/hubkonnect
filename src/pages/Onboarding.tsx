import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import ProfileComplete from "@/components/onboarding/ProfileComplete";

const TOTAL_STEPS = 4;

export interface OnboardingData {
  fullName: string;
  bio: string;
  instagram: string;
  linkedin: string;
  photoFile: File | null;
  photoPreview: string;
  memberTypes: string[];
  skills: string[];
  interests: string[];
  lookingFor: string[];
}

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    bio: "",
    instagram: "",
    linkedin: "",
    photoFile: null,
    photoPreview: "",
    memberTypes: [],
    skills: [],
    interests: [],
    lookingFor: [],
  });
  const navigate = useNavigate();

  const stepLabels = ["Basic Info", "Member Type", "Skills & Interests", "Looking For"];
  const progress = (step / TOTAL_STEPS) * 100;

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleComplete = () => {
    setShowComplete(true);
  };

  if (showComplete) {
    return (
      <ProfileComplete
        matchCount={12}
        onDone={() => navigate("/matches")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground p-4">
        <div className="container max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Step {step} of {TOTAL_STEPS}: {stepLabels[step - 1]}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 border border-foreground bg-card [&>div]:bg-accent" />
        </div>
      </div>

      {/* Step content */}
      <div className="container max-w-2xl pt-28 pb-12 px-4">
        {step === 1 && (
          <OnboardingStep1
            data={data}
            updateData={updateData}
            onNext={() => setStep(2)}
            onSkip={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <OnboardingStep2
            data={data}
            updateData={updateData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <OnboardingStep3
            data={data}
            updateData={updateData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <OnboardingStep4
            data={data}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
