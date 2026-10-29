'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobForm } from '@/components/jobs/job-form';
import { useCloseJob, useJob, usePublishJob, useUpdateJob } from '@/hooks/use-jobs';
import { JobStatus } from '@/types/enums';

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(params.id);
  const updateJob = useUpdateJob(params.id);
  const publish = usePublishJob();
  const close = useCloseJob();
  const [showJson, setShowJson] = useState(false);

  if (isLoading || !job) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <Badge>{job.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJson((v) => !v)}>
            {showJson ? 'Hide AI view' : 'AI view'}
          </Button>
          {job.status === JobStatus.DRAFT && (
            <Button
              size="sm"
              onClick={() =>
                publish.mutate(job.id, {
                  onSuccess: () => toast.success('Job published'),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Publish
            </Button>
          )}
          {job.status === JobStatus.OPEN && (
            <Button size="sm" variant="outline" onClick={() => close.mutate(job.id)}>
              Close
            </Button>
          )}
        </div>
      </div>

      {showJson && (
        <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
          {JSON.stringify(job, null, 2)}
        </pre>
      )}

      <JobForm
        defaultValues={{
          ...job,
          niceToHaveSkills: job.niceToHaveSkills ?? undefined,
          salaryMin: job.salaryMin ?? undefined,
          salaryMax: job.salaryMax ?? undefined,
          salaryCurrency: job.salaryCurrency ?? undefined,
          minYearsExperience: Number(job.minYearsExperience),
          reportsTo: job.reportsTo ?? undefined,
          teamSize: job.teamSize ?? undefined,
          skills: job.skills ?? [],
        }}
        submitLabel="Save changes"
        isSaving={updateJob.isPending}
        onSubmit={(values) =>
          updateJob.mutate(values, {
            onSuccess: () => toast.success('Job updated'),
            onError: (error) => toast.error(error.message || 'Could not update job'),
          })
        }
      />
    </div>
  );
}
