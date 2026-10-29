'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_FAMILY_OPTIONS, TRACK_PREFERENCE_OPTIONS } from './options';

export interface Step5Values {
  roleFamily: string;
  targetRole: string;
  trackPreference: string;
}

export function Step5CareerDirection({
  defaultValues,
  onSubmit,
  isSaving,
}: {
  defaultValues?: Partial<Step5Values>;
  onSubmit: (values: Step5Values) => void;
  isSaving: boolean;
}) {
  const [roleFamily, setRoleFamily] = useState(defaultValues?.roleFamily ?? ROLE_FAMILY_OPTIONS[0]);
  const [targetRole, setTargetRole] = useState(defaultValues?.targetRole ?? '');
  const [trackPreference, setTrackPreference] = useState(
    defaultValues?.trackPreference ?? 'UNSURE'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ roleFamily, targetRole, trackPreference });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Role family</Label>
        <Select value={roleFamily} onValueChange={(v) => v && setRoleFamily(v)}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FAMILY_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetRole">Target role</Label>
        <Input
          id="targetRole"
          placeholder="e.g. Backend Developer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Track preference</Label>
        <Select value={trackPreference} onValueChange={(v) => v && setTrackPreference(v)}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRACK_PREFERENCE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
