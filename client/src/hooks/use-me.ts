import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { PublicUser } from '@/types/models';

export function useMe() {
  return useQuery<PublicUser, ApiError>({
    queryKey: ['me'],
    queryFn: () => api.get<PublicUser>('/auth/me'),
    retry: false,
  });
}
