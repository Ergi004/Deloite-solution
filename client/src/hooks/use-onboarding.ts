import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OnboardingOptionSkill {
  id: string;
  name: string;
  category: string;
  roleFamilies: string[];
}

export interface OnboardingState {
  currentStep: number;
  responses: Record<number, Record<string, unknown>>;
  options: {
    industries: string[];
    skills: OnboardingOptionSkill[];
  };
}

export function useOnboardingState() {
  return useQuery<OnboardingState>({
    queryKey: ['onboarding'],
    queryFn: () => api.get<OnboardingState>('/onboarding'),
  });
}

export function useSaveOnboardingStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: unknown }) =>
      api.put<OnboardingState>(`/onboarding/steps/${step}`, data),
    onSuccess: (state) => {
      queryClient.setQueryData(['onboarding'], state);
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { consentPrivacy: boolean; consentAi: boolean }) =>
      api.post('/onboarding/complete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
}
