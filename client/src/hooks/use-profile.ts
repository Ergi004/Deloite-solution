import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StudentProfile, UserSkill } from '@/types/models';

export interface MeResponse {
  profile: StudentProfile;
  email: string;
  skills: UserSkill[];
}

export function useStudentMe() {
  return useQuery<MeResponse>({
    queryKey: ['students-me'],
    queryFn: () => api.get<MeResponse>('/students/me'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StudentProfile>) => api.patch<StudentProfile>('/students/me', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students-me'] }),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/students/me/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Could not upload avatar');
      return (await res.json()) as { avatarUrl: string };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students-me'] }),
  });
}

export function useUpsertSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { skillId: string; level: number }) => api.post('/students/me/skills', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students-me'] }),
  });
}

export function useRemoveSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => api.delete(`/students/me/skills/${skillId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students-me'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', data),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete('/students/me'),
  });
}

export async function downloadMyData() {
  const data = await api.get('/students/me/export');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-data.json';
  a.click();
  URL.revokeObjectURL(url);
}
