'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagListInput } from '@/components/jobs/tag-list-input';
import { useMyCompany, useUpdateCompany } from '@/hooks/use-company';
import { useState } from 'react';
import { Company } from '@/types/models';

export default function SettingsPage() {
  const { data: company, isLoading } = useMyCompany();

  if (isLoading || !company) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <SettingsForm key={company.id} company={company} />
    </div>
  );
}

function SettingsForm({ company }: { company: Company }) {
  const updateCompany = useUpdateCompany();
  const [name, setName] = useState(company.name);
  const [industries, setIndustries] = useState<string[]>(company.industries);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Company name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <TagListInput
          label="Industries"
          hint="These are shown to students during onboarding."
          values={industries}
          onChange={setIndustries}
        />
        <Button
          onClick={() =>
            updateCompany.mutate(
              { id: company.id, data: { name, industries } },
              {
                onSuccess: () => toast.success('Settings saved'),
                onError: (e) => toast.error(e.message),
              }
            )
          }
          disabled={updateCompany.isPending}
        >
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
