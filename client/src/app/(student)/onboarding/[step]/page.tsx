'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingStepper } from '@/components/onboarding/stepper';
import { Step1Studies, Step1Values } from '@/components/onboarding/step1-studies';
import { Step2Industry, Step2Values } from '@/components/onboarding/step2-industry';
import { Step3Skills, Step3Values } from '@/components/onboarding/step3-skills';
import { Step4SoftSkills, Step4Values } from '@/components/onboarding/step4-soft-skills';
import { Step5CareerDirection, Step5Values } from '@/components/onboarding/step5-career-direction';
import { Step6Goals, Step6Values } from '@/components/onboarding/step6-goals';
import { Step7Review } from '@/components/onboarding/step7-review';
import {
  useCompleteOnboarding,
  useOnboardingState,
  useSaveOnboardingStep,
} from '@/hooks/use-onboarding';

export default function OnboardingStepPage() {
  const params = useParams<{ step: string }>();
  const step = Number(params.step);
  const router = useRouter();

  const { data, isLoading } = useOnboardingState();
  const saveStep = useSaveOnboardingStep();
  const complete = useCompleteOnboarding();

  const [consentPrivacy, setConsentPrivacy] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('onboarding-consent-privacy') === 'true'
  );
  const [consentAi, setConsentAi] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('onboarding-consent-ai') === 'true'
  );

  const updateConsentPrivacy = (value: boolean) => {
    setConsentPrivacy(value);
    sessionStorage.setItem('onboarding-consent-privacy', String(value));
  };
  const updateConsentAi = (value: boolean) => {
    setConsentAi(value);
    sessionStorage.setItem('onboarding-consent-ai', String(value));
  };

  useEffect(() => {
    if (!data) return;
    if (step > data.currentStep) {
      router.replace(`/onboarding/${data.currentStep}`);
    }
  }, [data, step, router]);

  if (isLoading || !data || step > data.currentStep) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const goToNext = (nextStep: number) => router.push(`/onboarding/${nextStep}`);

  const handleSave = (stepNumber: number, values: unknown, next: number) => {
    saveStep.mutate(
      { step: stepNumber, data: values },
      {
        onSuccess: () => goToNext(next),
        onError: (error) => toast.error(error.message || 'Could not save this step'),
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <OnboardingStepper currentFormStep={step} maxUnlockedStep={data.currentStep} />
      <Card>
        <CardContent key={step} className="animate-fade-up pt-6">
          {step === 1 && (
            <Step1Studies
              defaultValues={data.responses[1] as Partial<Step1Values>}
              onSubmit={(v) => handleSave(1, v, 2)}
              isSaving={saveStep.isPending}
            />
          )}
          {step === 2 && (
            <Step2Industry
              industries={data.options.industries}
              defaultValues={data.responses[2] as Partial<Step2Values>}
              onSubmit={(v) => handleSave(2, v, 3)}
              isSaving={saveStep.isPending}
            />
          )}
          {step === 3 && (
            <Step3Skills
              allSkills={data.options.skills}
              defaultValues={data.responses[3] as Partial<Step3Values>}
              onSubmit={(v) => handleSave(3, v, 4)}
              isSaving={saveStep.isPending}
            />
          )}
          {step === 4 && (
            <Step4SoftSkills
              defaultValues={data.responses[4] as Partial<Step4Values>}
              onSubmit={(v) => handleSave(4, v, 5)}
              isSaving={saveStep.isPending}
            />
          )}
          {step === 5 && (
            <Step5CareerDirection
              defaultValues={data.responses[5] as Partial<Step5Values>}
              onSubmit={(v) => handleSave(5, v, 6)}
              isSaving={saveStep.isPending}
            />
          )}
          {step === 6 && (
            <Step6Goals
              defaultValues={data.responses[6] as Partial<Step6Values>}
              onSubmit={(v) => handleSave(6, v, 7)}
              isSaving={saveStep.isPending}
              consentPrivacy={consentPrivacy}
              consentAi={consentAi}
              onConsentPrivacyChange={updateConsentPrivacy}
              onConsentAiChange={updateConsentAi}
            />
          )}
          {step === 7 && (
            <Step7Review
              responses={data.responses}
              skills={data.options.skills}
              consentPrivacy={consentPrivacy}
              consentAi={consentAi}
              isSubmitting={complete.isPending}
              onGenerate={() =>
                complete.mutate(
                  { consentPrivacy, consentAi },
                  {
                    onSuccess: () => router.push('/career-path'),
                    onError: (error) =>
                      toast.error(error.message || 'Could not generate your career path'),
                  }
                )
              }
            />
          )}
          {step > 7 && <p>Onboarding complete. Redirecting…</p>}
        </CardContent>
      </Card>
    </div>
  );
}
