import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Course } from '@/types/models';

export interface CourseSkillInput {
  skillId: string;
  levelGained: number;
}

export interface UpsertCourseInput {
  title: string;
  provider: string;
  url: string;
  format: string;
  level: string;
  estimatedHours: number;
  language?: string;
  cost?: string;
  isInternal?: boolean;
  skills: CourseSkillInput[];
}

export function useCourses() {
  return useQuery<Course[]>({ queryKey: ['courses'], queryFn: () => api.get<Course[]>('/courses') });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertCourseInput) => api.post<Course>('/courses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}
