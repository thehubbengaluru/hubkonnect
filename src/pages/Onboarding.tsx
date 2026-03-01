import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import ProfileComplete from "@/components/onboarding/ProfileComplete";
import StepIndicator from "@/components/onboarding/StepIndicator";
import StepTransition from "@/components/onboarding/StepTransition";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const NUDGES = [
  "Great start! 🚀",
  "Nice — you're building your network! 🤝",
  "Almost there! One more step! ⚡",
  "Let's go! Finish strong! 🎯",
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [showComplete, setShowComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const stepLabels = ["Basics", "Type", "Skills", "Goals"];

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goTo = (target: number) => {
    setDirection(target > step ? "forward" : "back");
    setStep(target);
  };

  const handleComplete = async () => {
    if (!user || saving) return;
    setSaving(true);

    try {
      let avatarUrl = "";
      if (data.photoFile) {
        const ext = data.photoFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, data.photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error: profileErr } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: data.fullName,
          bio: data.bio,
          instagram: data.instagram,
          linkedin: data.linkedin,
          avatar_url: avatarUrl,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      const deleteAndInsert = async (
        table: string,
        column: string,
        values: string[]
      ) => {
        const client = supabase as any;
        await client.from(table).delete().eq("profile_id", user.id);
        if (values.length > 0) {
          const rows = values.map((v: string) => ({ profile_id: user.id, [column]: v }));
          const { error } = await client.from(table).insert(rows);
          if (error) throw error;
        }
      };

      await Promise.all([
        deleteAndInsert("profile_member_types", "member_type", data.memberTypes),
        deleteAndInsert("profile_skills", "skill", data.skills),
        deleteAndInsert("profile_interests", "interest", data.interests),
        deleteAndInsert("profile_looking_for", "looking_for", data.lookingFor),
      ]);

      await refreshProfile();
      setShowComplete(true);
    } catch (err: any) {
      console.error("Onboarding save error:", err);
      toast({
        title: "Error saving profile",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (showComplete) {
    return (
      <ProfileComplete
        matchCount={12}
        onDone={() => navigate("/for-you")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Step indicator header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground p-4">
        <div className="container max-w-2xl space-y-3">
          <StepIndicator
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            labels={stepLabels}
            onStepClick={goTo}
          />
          <p className="font-mono text-xs text-center text-accent font-bold">
            {NUDGES[step - 1]}
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="container max-w-2xl pt-32 pb-12 px-4">
        <StepTransition stepKey={step} direction={direction}>
          {step === 1 && (
            <OnboardingStep1
              data={data}
              updateData={updateData}
              onNext={() => goTo(2)}
              onSkip={() => goTo(2)}
            />
          )}
          {step === 2 && (
            <OnboardingStep2
              data={data}
              updateData={updateData}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
            />
          )}
          {step === 3 && (
            <OnboardingStep3
              data={data}
              updateData={updateData}
              onNext={() => goTo(4)}
              onBack={() => goTo(2)}
            />
          )}
          {step === 4 && (
            <OnboardingStep4
              data={data}
              updateData={updateData}
              onComplete={handleComplete}
              onBack={() => goTo(3)}
            />
          )}
        </StepTransition>
      </div>
    </div>
  );
};

export default Onboarding;
