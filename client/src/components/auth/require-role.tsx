'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-me';
import { UserRole } from '@/types/enums';
import { Skeleton } from '@/components/ui/skeleton';

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === UserRole.COMPANY_ADMIN ? '/company/dashboard' : '/career-path');
    }
  }, [isLoading, isError, user, role, router]);

  if (isLoading || isError || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
