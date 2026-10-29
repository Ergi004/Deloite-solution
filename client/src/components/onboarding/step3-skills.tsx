'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn, firstOf } from '@/lib/utils';
import { OnboardingOptionSkill } from '@/hooks/use-onboarding';

export interface Step3Values {
  skills: { skillId: string; level: number }[];
  certifications?: string[];
}

export const LEVEL_LABELS = ['', 'Aware', 'Basic', 'Comfortable', 'Strong', 'Expert'];

export function Step3Skills({
  allSkills,
  defaultValues,
  onSubmit,
  isSaving,
}: {
  allSkills: OnboardingOptionSkill[];
  defaultValues?: Partial<Step3Values>;
  onSubmit: (values: Step3Values) => void;
  isSaving: boolean;
}) {
  const [selected, setSelected] = useState<Map<string, number>>(
    new Map((defaultValues?.skills ?? []).map((s) => [s.skillId, s.level]))
  );
  const [search, setSearch] = useState('');
  const [certifications, setCertifications] = useState<string[]>(
    defaultValues?.certifications ?? []
  );
  const [certInput, setCertInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const filtered = allSkills.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    const byCategory = new Map<string, OnboardingOptionSkill[]>();
    for (const s of filtered) {
      const list = byCategory.get(s.category) ?? [];
      list.push(s);
      byCategory.set(s.category, list);
    }
    return byCategory;
  }, [allSkills, search]);

  const toggle = (skillId: string) => {
    const next = new Map(selected);
    if (next.has(skillId)) next.delete(skillId);
    else next.set(skillId, 3);
    setSelected(next);
  };

  const setLevel = (skillId: string, level: number) => {
    const next = new Map(selected);
    next.set(skillId, level);
    setSelected(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.size < 3) {
      setError('Pick at least 3 skills');
      return;
    }
    setError(null);
    onSubmit({
      skills: Array.from(selected.entries()).map(([skillId, level]) => ({ skillId, level })),
      certifications: certifications.length ? certifications : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Search skills</Label>
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto rounded-md border p-3">
        {Array.from(grouped.entries()).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{category}</p>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant={selected.has(skill.id) ? 'default' : 'outline'}
                  className={cn(
                    'h-9 cursor-pointer select-none px-4 py-2 text-sm transition-transform duration-150 [@media(hover:hover)]:hover:scale-105 active:scale-95'
                  )}
                  onClick={() => toggle(skill.id)}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="space-y-3">
          <Label>Rate your level</Label>
          {Array.from(selected.entries()).map(([skillId, level]) => {
            const skill = allSkills.find((s) => s.id === skillId);
            if (!skill) return null;
            return (
              <div key={skillId} className="flex items-center gap-4">
                <span className="w-40 flex-shrink-0 text-sm">{skill.name}</span>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[level]}
                  onValueChange={(v) => setLevel(skillId, firstOf(v))}
                  className="flex-1"
                />
                <span className="w-24 flex-shrink-0 text-right text-xs text-muted-foreground">
                  {LEVEL_LABELS[level]}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2">
        <Label>Certifications (optional)</Label>
        <div className="flex gap-2">
          <Input
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            placeholder="e.g. AWS Cloud Practitioner"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (certInput.trim()) {
                setCertifications([...certifications, certInput.trim()]);
                setCertInput('');
              }
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {certifications.map((c, i) => (
            <Badge
              key={`${c}-${i}`}
              variant="secondary"
              className="cursor-pointer transition-transform duration-150 [@media(hover:hover)]:hover:scale-105 active:scale-95"
              onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}
            >
              {c} ×
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
