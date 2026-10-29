import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { CareerPath } from '@/types/models';
import { CareerPathStatus, PathFeedback } from '@/types/enums';

export function useLatestCareerPath() {
  return useQuery<CareerPath | null, ApiError>({
    queryKey: ['career-path', 'latest'],
    queryFn: async () => {
      try {
        return await api.get<CareerPath>('/career-path/latest');
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    refetchInterval: (query) =>
      query.state.data?.status === CareerPathStatus.GENERATING ? 2500 : false,
  });
}

export function useGenerateCareerPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<CareerPath>('/career-path/generate'),
    onSuccess: (data) => {
      queryClient.setQueryData(['career-path', 'latest'], data);
    },
  });
}

export function useCareerPathFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback, note }: { id: string; feedback: PathFeedback; note?: string }) =>
      api.post<CareerPath>(`/career-path/${id}/feedback`, { feedback, note }),
    onSuccess: (data) => {
      queryClient.setQueryData(['career-path', 'latest'], data);
    },
  });
}
