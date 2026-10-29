'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-me';
import { UserRole } from '@/types/enums';

export default function RootPage() {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !user) {
      router.replace('/register');
      return;
    }
    router.replace(user.role === UserRole.COMPANY_ADMIN ? '/company/dashboard' : '/career-path');
  }, [isLoading, isError, user, router]);

  return null;
}
