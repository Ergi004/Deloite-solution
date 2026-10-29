import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await api.post('/auth/logout').catch(() => undefined);
    queryClient.clear();
    router.replace('/login');
  };
}
