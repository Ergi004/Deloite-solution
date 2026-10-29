'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useCreateBulkInvitations,
  useCreateInvitation,
  useInvitations,
  useRevokeInvitation,
} from '@/hooks/use-invitations';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  used: 'default',
  expired: 'outline',
  revoked: 'destructive',
};

export default function InvitationsPage() {
  const { data: invitations, isLoading } = useInvitations();
  const createOne = useCreateInvitation();
  const createBulk = useCreateBulkInvitations();
  const revoke = useRevokeInvitation();

  const [email, setEmail] = useState('');
  const [emailsBulk, setEmailsBulk] = useState('');
  const [anonymousCount, setAnonymousCount] = useState(1);
  const [newLinks, setNewLinks] = useState<string[] | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-md border p-4">
          <Label>Invite one person</Label>
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={() =>
                createOne.mutate(
                  { email: email || undefined },
                  {
                    onSuccess: (res) => setNewLinks([res.url]),
                    onError: (e) => toast.error(e.message),
                  }
                )
              }
              disabled={createOne.isPending}
            >
              Create
            </Button>
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-4">
          <Label>Bulk invite (paste emails, one per line)</Label>
          <textarea
            className="w-full rounded-md border bg-transparent p-2 text-sm"
            rows={3}
            value={emailsBulk}
            onChange={(e) => setEmailsBulk(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                createBulk.mutate(
                  {
                    emails: emailsBulk
                      .split('\n')
                      .map((e) => e.trim())
                      .filter(Boolean),
                  },
                  {
                    onSuccess: (res) => setNewLinks(res.map((r) => r.url)),
                    onError: (e) => toast.error(e.message),
                  }
                )
              }
              disabled={createBulk.isPending || !emailsBulk.trim()}
            >
              Invite by email
            </Button>
            <span className="text-xs text-muted-foreground">or</span>
            <Input
              type="number"
              min={1}
              className="w-20"
              value={anonymousCount}
              onChange={(e) => setAnonymousCount(Number(e.target.value))}
            />
            <Button
              variant="outline"
              onClick={() =>
                createBulk.mutate(
                  { anonymousCount },
                  {
                    onSuccess: (res) => setNewLinks(res.map((r) => r.url)),
                    onError: (e) => toast.error(e.message),
                  }
                )
              }
              disabled={createBulk.isPending}
            >
              anonymous links
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Note</TableHead>
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
            {(invitations ?? []).map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email ?? <span className="text-muted-foreground">Anonymous</span>}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{inv.note ?? '—'}</TableCell>
                <TableCell className="text-right">
                  {inv.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => revoke.mutate(inv.id)}>
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(newLinks)} onOpenChange={() => setNewLinks(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite link{newLinks && newLinks.length > 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Copy this now — you won&apos;t be able to see the full link again.
          </p>
          <div className="space-y-2">
            {newLinks?.map((url) => (
              <div key={url} className="flex items-center gap-2">
                <Input readOnly value={url} className="text-xs" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    toast.success('Copied');
                  }}
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
