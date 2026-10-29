import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CareerPath, PublicUser, StudentProfile, UserSkill } from '@/types/models';

export interface TalentListItem {
  user: PublicUser & { createdAt: string };
  profile: StudentProfile | null;
  latestPathStatus: string | null;
  fitScore: number | null;
}

export interface TalentListResponse {
  items: TalentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export function useTalents(params: { page: number; search?: string; status?: string }) {
  const query = new URLSearchParams({ page: String(params.page) });
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);

  return useQuery<TalentListResponse>({
    queryKey: ['talents', params],
    queryFn: () => api.get<TalentListResponse>(`/talents?${query.toString()}`),
  });
}

export interface TalentDetail {
  user: PublicUser;
  profile: StudentProfile | null;
  skills: UserSkill[];
  onboardingResponses: { step: number; data: Record<string, unknown> }[];
  pathHistory: CareerPath[];
  latestPath: CareerPath | null;
}

export function useTalentDetail(id: string) {
  return useQuery<TalentDetail>({
    queryKey: ['talent', id],
    queryFn: () => api.get<TalentDetail>(`/talents/${id}`),
  });
}

export function useArchiveTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/talents/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['talents'] }),
  });
}

export function useRestoreTalent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/talents/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['talents'] }),
  });
}

export function useRegenerateTalentPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/talents/${id}/regenerate-path`),
    onSuccess: (_data, id) => queryClient.invalidateQueries({ queryKey: ['talent', id] }),
  });
}
