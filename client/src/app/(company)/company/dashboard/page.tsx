'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { ONBOARDING_STEP_TITLES } from '@/types/enums';

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function BarList({ data, max }: { data: { label: string; value: number }[]; max: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{d.label}</span>
            <span className="text-muted-foreground">{d.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${max > 0 ? (d.value / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
    </div>
  );
}

export default function CompanyDashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const talentsByRole = Object.entries(data.talentsByTargetRole).map(([label, value]) => ({
    label,
    value,
  }));
  const funnel = Object.entries(data.onboardingFunnelByStep)
    .map(([step, value]) => ({ label: ONBOARDING_STEP_TITLES[Number(step)] ?? `Step ${step}`, value }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total talents" value={data.totalTalents} />
        <Kpi label="Onboarding completion" value={`${data.onboardingCompletionPct}%`} />
        <Kpi label="Paths generated" value={data.pathsGenerated} />
        <Kpi label="Open jobs" value={data.openJobs} />
        <Kpi label="Avg. fit score" value={data.averageFitScore ?? '—'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Talents by target role</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              data={talentsByRole}
              max={Math.max(1, ...talentsByRole.map((t) => t.value))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top skill gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              data={data.topSkillGaps.map((g) => ({ label: g.name, value: g.count }))}
              max={Math.max(1, ...data.topSkillGaps.map((g) => g.count))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onboarding funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={funnel} max={Math.max(1, ...funnel.map((f) => f.value))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
            {data.recentActivity.map((a) => (
              <div key={a.id} className="flex justify-between text-sm">
                <span>{a.action.replaceAll('_', ' ').toLowerCase()}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
