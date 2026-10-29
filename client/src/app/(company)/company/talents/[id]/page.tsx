'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useArchiveTalent,
  useRegenerateTalentPath,
  useRestoreTalent,
  useTalentDetail,
} from '@/hooks/use-talents';
import { UserStatus } from '@/types/enums';

export default function TalentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useTalentDetail(params.id);
  const archive = useArchiveTalent();
  const restore = useRestoreTalent();
  const regenerate = useRegenerateTalentPath();

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const { user, profile, skills, pathHistory, latestPath } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ''}` : user.email}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.status === UserStatus.ARCHIVED ? (
            <Button variant="outline" onClick={() => restore.mutate(params.id)}>
              Restore
            </Button>
          ) : (
            <Button variant="outline" onClick={() => archive.mutate(params.id)}>
              Archive
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() =>
              regenerate.mutate(params.id, {
                onSuccess: () => toast.success('Regenerating career path'),
                onError: (e) => toast.error(e.message),
              })
            }
            disabled={regenerate.isPending}
          >
            Regenerate path
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>University: {profile?.university ?? '—'}</p>
            <p>Field of study: {profile?.fieldOfStudy ?? '—'}</p>
            <p>Preferred industry: {profile?.preferredIndustry ?? '—'}</p>
            <p>Target role: {profile?.targetRole ?? '—'}</p>
            <p>Target horizon: {profile?.targetHorizonYears ?? '—'} years</p>
            <p>Onboarding step: {profile?.onboardingStep ?? 1}/7</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s.id} variant="secondary">
                {s.skill.name} ({s.level}/5)
              </Badge>
            ))}
            {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest career path</CardTitle>
        </CardHeader>
        <CardContent>
          {!latestPath?.output ? (
            <p className="text-sm text-muted-foreground">No career path generated yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{latestPath.output.primaryTarget.title}</p>
              <p className="text-muted-foreground">{latestPath.output.summary}</p>
              <p>Fit score: {latestPath.output.primaryTarget.fitScore}%</p>
              <p>Generation method: {latestPath.generationMethod}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Path history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {pathHistory.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <span>Version {p.version}</span>
              <Badge variant="outline">{p.status}</Badge>
            </div>
          ))}
          {pathHistory.length === 0 && (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
