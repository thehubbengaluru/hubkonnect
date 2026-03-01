import { Check } from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  onStepClick: (step: number) => void;
}

const StepIndicator = ({ currentStep, totalSteps, labels, onStepClick }: Props) => {
  return (
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isClickable = isCompleted;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step node */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`relative flex flex-col items-center gap-1.5 group ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`h-8 w-8 sm:h-10 sm:w-10 border-2 border-foreground flex items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-foreground text-background"
                    : isCurrent
                    ? "bg-accent text-accent-foreground shadow-brutal-sm animate-[pulse_2s_ease-in-out_infinite]"
                    : "bg-card text-muted-foreground"
                } ${isClickable ? "group-hover:shadow-brutal-sm group-hover:-translate-x-px group-hover:-translate-y-px" : ""}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  step
                )}
              </div>
              <span
                className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider whitespace-nowrap ${
                  isCurrent ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                {labels[i]}
              </span>
            </button>

            {/* Connector line */}
            {step < totalSteps && (
              <div className="flex-1 mx-2 mt-[-20px]">
                <div
                  className={`h-0.5 w-full transition-colors duration-300 ${
                    isCompleted ? "bg-foreground" : "bg-muted"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
