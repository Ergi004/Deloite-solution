'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { JobForm } from '@/components/jobs/job-form';
import { useCreateJob } from '@/hooks/use-jobs';

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">New job</h1>
      <JobForm
        isSaving={createJob.isPending}
        onSubmit={(values) =>
          createJob.mutate(values, {
            onSuccess: (job) => {
              toast.success('Job created as a draft');
              router.push(`/company/jobs/${job.id}`);
            },
            onError: (error) => toast.error(error.message || 'Could not create job'),
          })
        }
      />
    </div>
  );
}
