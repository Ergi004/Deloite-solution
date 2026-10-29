'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RequireRole } from '@/components/auth/require-role';
import { StudentNav } from '@/components/layout/student-nav';
import { UserRole } from '@/types/enums';
import { useOnboardingState } from '@/hooks/use-onboarding';

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useOnboardingState();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !data) return;
    const onboardingComplete = data.currentStep >= 7;
    if (!onboardingComplete && !pathname.startsWith('/onboarding')) {
      router.replace(`/onboarding/${data.currentStep}`);
    }
  }, [isLoading, data, pathname, router]);

  return <>{children}</>;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={UserRole.STUDENT}>
      <OnboardingGate>
        <StudentNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </OnboardingGate>
    </RequireRole>
  );
}
