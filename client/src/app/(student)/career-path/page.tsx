'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FitRing } from '@/components/career-path/fit-ring';
import { ProgressScreen } from '@/components/career-path/progress-screen';
import { useCareerPathFeedback, useGenerateCareerPath, useLatestCareerPath } from '@/hooks/use-career-path';
import { CareerPathStatus, PathFeedback } from '@/types/enums';
import { ThumbsDown, ThumbsUp, Printer, RefreshCw, AlertTriangle } from 'lucide-react';

const PRIORITY_VARIANT: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  HIGH: 'destructive',
  MEDIUM: 'secondary',
  LOW: 'outline',
};

export default function CareerPathPage() {
  const { data: careerPath, isLoading } = useLatestCareerPath();
  const generate = useGenerateCareerPath();
  const feedback = useCareerPathFeedback();

  const handleGenerate = () => {
    generate.mutate(undefined, {
      onError: (error) => toast.error(error.message || 'Could not start generation'),
    });
  };

  if (isLoading) {
    return <ProgressScreen />;
  }

  if (!careerPath) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">No career path yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Finish onboarding to generate your first personalised career path.
        </p>
        <Button onClick={handleGenerate} disabled={generate.isPending}>
          Generate my career path
        </Button>
      </div>
    );
  }

  if (careerPath.status === CareerPathStatus.GENERATING) {
    return <ProgressScreen />;
  }

  if (careerPath.status === CareerPathStatus.FAILED) {
    const reason = careerPath.validationReport?.reason;
    return (
      <Alert variant="destructive" className="mx-auto max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {reason === 'no_candidate_jobs' ? 'No matching roles yet' : 'Something went wrong'}
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            {reason === 'no_candidate_jobs'
              ? "There isn't an open role in your chosen industry and field yet. Your HR team has been notified — check back soon, or try a different target in your profile."
              : 'We could not generate your career path this time.'}
          </p>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generate.isPending}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const output = careerPath.output;
  if (!output) return null;

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your path to {output.primaryTarget.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{output.summary}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generate.isPending}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" /> Regenerate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 pt-6 sm:flex-row">
          <FitRing score={output.primaryTarget.fitScore} />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">Primary target</p>
            <h2 className="text-xl font-semibold">{output.primaryTarget.title}</h2>
            <p className="text-sm text-muted-foreground">{output.primaryTarget.whyItFits}</p>
            <p className="text-sm">
              Estimated time to be ready: <strong>{output.primaryTarget.estimatedMonthsToReady} months</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {output.alternatives.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {output.alternatives.map((alt) => (
            <Card key={alt.jobId}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {alt.title}
                  {alt.isAdjacent && <Badge variant="outline">Adjacent</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{alt.tradeOff}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills to build</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {output.skillGaps.map((gap) => (
              <div key={gap.skillId} className="flex items-center justify-between text-sm">
                <span>{gap.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {gap.currentLevel}/5 → {gap.requiredLevel}/5
                  </span>
                  <Badge variant={PRIORITY_VARIANT[gap.priority]}>{gap.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {output.strengths.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Keep building — your strengths will show up here as your skills grow.
              </p>
            )}
            {output.strengths.map((s) => (
              <div key={s.skillId} className="text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground"> — {s.note}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Your roadmap</h3>
        <div className="space-y-4">
          {output.phases
            .sort((a, b) => a.order - b.order)
            .map((phase) => (
              <Card key={phase.order}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Months {phase.startMonth}–{phase.endMonth}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{phase.focus}</p>
                  {phase.courses.length > 0 && (
                    <div className="space-y-1.5">
                      {phase.courses.map((c) => (
                        <div key={c.courseId} className="rounded-md bg-muted/50 p-2 text-sm">
                          <p className="font-medium">{c.reason}</p>
                          <p className="text-xs text-muted-foreground">{c.estimatedHours}h</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-md border p-2 text-sm">
                    <p className="font-medium">Milestone: {phase.milestone.description}</p>
                    <p className="text-xs text-muted-foreground">{phase.milestone.evidence}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Success signal: {phase.successSignal}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {output.progressionLadder.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression ladder at your company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {output.progressionLadder.map((p) => (
              <div key={p.jobId} className="flex items-center justify-between text-sm">
                <span>{p.title}</span>
                <span className="text-xs text-muted-foreground">
                  ~{p.typicalMonthsFromStart} months
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly plan ({output.weeklyPlan.hoursPerWeek}h/week)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {output.weeklyPlan.suggestedSplit.map((s) => (
            <div key={s.activity} className="flex items-center justify-between text-sm">
              <span>{s.activity}</span>
              <span className="text-muted-foreground">{s.hours}h</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {output.considerations.length > 0 && (
        <Alert>
          <AlertTitle>Things to consider</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {output.considerations.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next steps this week</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-1 pl-4 text-sm">
            {output.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 print:hidden">
        <span className="text-sm text-muted-foreground">Was this path helpful?</span>
        <Button
          variant={careerPath.feedback === PathFeedback.UP ? 'default' : 'outline'}
          size="icon"
          onClick={() => feedback.mutate({ id: careerPath.id, feedback: PathFeedback.UP })}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant={careerPath.feedback === PathFeedback.DOWN ? 'default' : 'outline'}
          size="icon"
          onClick={() => feedback.mutate({ id: careerPath.id, feedback: PathFeedback.DOWN })}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
