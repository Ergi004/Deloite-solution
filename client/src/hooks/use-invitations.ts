import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Invitation } from '@/types/models';

export function useInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: () => api.get<Invitation[]>('/invitations'),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email?: string; note?: string }) =>
      api.post<{ invitation: Invitation; url: string }>('/invitations', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useCreateBulkInvitations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { emails?: string[]; anonymousCount?: number }) =>
      api.post<{ invitation: Invitation; url: string }[]>('/invitations/bulk', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/invitations/${id}/revoke`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}
