import { cn } from '@/lib/utils';
import { ONBOARDING_STEP_TITLES } from '@/types/enums';

export function OnboardingStepper({
  currentFormStep,
  maxUnlockedStep,
}: {
  currentFormStep: number;
  maxUnlockedStep: number;
}) {
  const steps = Object.entries(ONBOARDING_STEP_TITLES);

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span key={`count-${currentFormStep}`} className="animate-fade-in tabular-nums">
          Step {currentFormStep} of {steps.length}
        </span>
        <span key={`title-${currentFormStep}`} className="animate-fade-in font-medium text-foreground">
          {ONBOARDING_STEP_TITLES[currentFormStep]}
        </span>
      </div>
      <div className="flex gap-1.5">
        {steps.map(([stepStr]) => {
          const step = Number(stepStr);
          const reached = step <= maxUnlockedStep;
          const active = step === currentFormStep;
          return (
            <div
              key={step}
              className={cn(
                'h-1.5 flex-1 origin-center rounded-full bg-muted transition-[background-color,transform] duration-300 ease-out',
                reached && 'bg-primary/40',
                active && 'scale-y-150 bg-primary'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
