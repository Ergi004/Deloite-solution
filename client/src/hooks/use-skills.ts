import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skill } from '@/types/models';

export function useSkills() {
  return useQuery<Skill[]>({ queryKey: ['skills'], queryFn: () => api.get<Skill[]>('/skills') });
}
