import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Company } from '@/types/models';

export function useMyCompany() {
  return useQuery<Company>({ queryKey: ['company'], queryFn: () => api.get<Company>('/companies/mine') });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      api.patch<Company>(`/companies/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company'] }),
  });
}
