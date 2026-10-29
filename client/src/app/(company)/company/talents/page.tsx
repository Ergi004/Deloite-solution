'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
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
import { useTalents, TalentListItem } from '@/hooks/use-talents';

const columns: ColumnDef<TalentListItem>[] = [
  {
    header: 'Name',
    accessorFn: (row) =>
      row.profile?.firstName ? `${row.profile.firstName} ${row.profile.lastName ?? ''}` : row.user.email,
    cell: ({ row }) => (
      <Link href={`/company/talents/${row.original.user.id}`} className="font-medium underline-offset-2 hover:underline">
        {row.original.profile?.firstName
          ? `${row.original.profile.firstName} ${row.original.profile.lastName ?? ''}`
          : row.original.user.email}
      </Link>
    ),
  },
  { header: 'Email', accessorFn: (row) => row.user.email },
  { header: 'Target role', accessorFn: (row) => row.profile?.targetRole ?? '—' },
  {
    header: 'Onboarding',
    cell: ({ row }) => `${row.original.profile?.onboardingStep ?? 1}/7`,
  },
  {
    header: 'Fit score',
    cell: ({ row }) => (row.original.fitScore != null ? `${row.original.fitScore}%` : '—'),
  },
  {
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline">{row.original.user.status}</Badge>,
  },
];

export default function TalentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTalents({ page, search: search || undefined });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Talents</h1>
        <Input
          placeholder="Search by email…"
          className="w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                  No talents found.
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.page} · {data.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
