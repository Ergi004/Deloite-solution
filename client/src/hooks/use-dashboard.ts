import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardSummary {
  totalTalents: number;
  onboardingCompletionPct: number;
  pathsGenerated: number;
  openJobs: number;
  averageFitScore: number | null;
  talentsByTargetRole: Record<string, number>;
  topSkillGaps: { skillId: string; name: string; count: number }[];
  onboardingFunnelByStep: Record<number, number>;
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    metadata: Record<string, unknown> | null;
  }[];
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<DashboardSummary>('/dashboard/summary'),
  });
}
