'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCloseJob, useDuplicateJob, useJobs, usePublishJob } from '@/hooks/use-jobs';
import { JobStatus } from '@/types/enums';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  OPEN: 'default',
  PLANNED: 'secondary',
  DRAFT: 'outline',
  CLOSED: 'destructive',
};

export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs();
  const publish = usePublishJob();
  const close = useCloseJob();
  const duplicate = useDuplicateJob();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = (jobs ?? []).filter((j) => statusFilter === 'ALL' || j.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {Object.values(JobStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button render={<Link href="/company/jobs/new">New job</Link>} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Role family</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {filtered.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Link href={`/company/jobs/${job.id}`} className="font-medium hover:underline">
                    {job.title}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{job.code}</TableCell>
                <TableCell>{job.roleFamily}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {job.status === JobStatus.DRAFT && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          publish.mutate(job.id, {
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
                    <Button size="sm" variant="ghost" onClick={() => duplicate.mutate(job.id)}>
                      Duplicate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No jobs match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
