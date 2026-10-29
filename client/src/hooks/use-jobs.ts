import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Job } from '@/types/models';

export interface JobSkillInput {
  skillId: string;
  minLevel: number;
  weight: number;
  isRequired: boolean;
}

export interface UpsertJobInput {
  code: string;
  title: string;
  department: string;
  roleFamily: string;
  industry: string;
  seniority: string;
  employmentType?: string;
  location: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  openings?: number;
  status?: string;
  summary: string;
  responsibilities: string[];
  niceToHaveSkills?: string[];
  toolsAndTech: string[];
  educationRequirement: string;
  minYearsExperience: number;
  languages: string[];
  softSkillRequirements: string[];
  monthsToProductivity: number;
  promotionCriteria: string[];
  reportsTo?: string;
  teamSize?: number;
  skills: JobSkillInput[];
}

export function useJobs() {
  return useQuery<Job[]>({ queryKey: ['jobs'], queryFn: () => api.get<Job[]>('/jobs') });
}

export function useJob(id: string) {
  return useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => api.get<Job>(`/jobs/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertJobInput) => api.post<Job>('/jobs', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertJobInput) => api.put<Job>(`/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
    },
  });
}

export function usePublishJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Job>(`/jobs/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Job>(`/jobs/${id}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useDuplicateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Job>(`/jobs/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
}
