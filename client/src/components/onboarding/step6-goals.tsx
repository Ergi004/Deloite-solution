'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, firstOf } from '@/lib/utils';
import { EXPECTATION_OPTIONS, TARGET_LEVEL_OPTIONS } from './options';

export interface Step6Values {
  targetHorizonYears: number;
  targetLevel: string;
  goalStatement: string;
  weeklyLearningHours: number;
  expectations: string[];
  salaryExpectationBand?: string;
}

export function Step6Goals({
  defaultValues,
  onSubmit,
  isSaving,
  consentPrivacy,
  consentAi,
  onConsentPrivacyChange,
  onConsentAiChange,
}: {
  defaultValues?: Partial<Step6Values>;
  onSubmit: (values: Step6Values) => void;
  isSaving: boolean;
  consentPrivacy: boolean;
  consentAi: boolean;
  onConsentPrivacyChange: (value: boolean) => void;
  onConsentAiChange: (value: boolean) => void;
}) {
  const [horizon, setHorizon] = useState(String(defaultValues?.targetHorizonYears ?? 2));
  const [targetLevel, setTargetLevel] = useState(defaultValues?.targetLevel ?? TARGET_LEVEL_OPTIONS[1]);
  const [goalStatement, setGoalStatement] = useState(defaultValues?.goalStatement ?? '');
  const [hours, setHours] = useState(defaultValues?.weeklyLearningHours ?? 6);
  const [expectations, setExpectations] = useState<string[]>(defaultValues?.expectations ?? []);
  const [salaryBand, setSalaryBand] = useState(defaultValues?.salaryExpectationBand ?? '');

  const toggleExpectation = (v: string) => {
    setExpectations((prev) => (prev.includes(v) ? prev.filter((e) => e !== v) : [...prev, v]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      targetHorizonYears: Number(horizon),
      targetLevel,
      goalStatement,
      weeklyLearningHours: hours,
      expectations,
      salaryExpectationBand: salaryBand || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Timeline</Label>
          <Select value={horizon} onValueChange={(v) => v && setHorizon(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} year{y > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target level</Label>
          <Select value={targetLevel} onValueChange={(v) => v && setTargetLevel(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_LEVEL_OPTIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalStatement">In {horizon} year{Number(horizon) > 1 ? 's' : ''} I want to become…</Label>
        <Textarea
          id="goalStatement"
          maxLength={300}
          rows={3}
          required
          value={goalStatement}
          onChange={(e) => setGoalStatement(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Weekly learning hours ({hours}h/week)</Label>
        <Slider min={2} max={20} step={1} value={[hours]} onValueChange={(v) => setHours(firstOf(v))} />
      </div>

      <div className="space-y-2">
        <Label>What matters to you? (optional)</Label>
        <div className="flex flex-wrap gap-2.5">
          {EXPECTATION_OPTIONS.map((opt) => (
            <Badge
              key={opt}
              variant={expectations.includes(opt) ? 'default' : 'outline'}
              className={cn(
                'h-9 cursor-pointer select-none px-4 py-2 text-sm transition-transform duration-150 [@media(hover:hover)]:hover:scale-105 active:scale-95'
              )}
              onClick={() => toggleExpectation(opt)}
            >
              {opt}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salaryBand">Salary expectation (optional)</Label>
        <Input
          id="salaryBand"
          placeholder="e.g. 800-1000 EUR/month"
          value={salaryBand}
          onChange={(e) => setSalaryBand(e.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="consentPrivacy"
            checked={consentPrivacy}
            onCheckedChange={(v) => onConsentPrivacyChange(v === true)}
          />
          <Label htmlFor="consentPrivacy" className="text-sm font-normal leading-snug">
            I agree to the{' '}
            <a href="/privacy" target="_blank" className="text-primary underline underline-offset-2">
              privacy policy
            </a>
            .
          </Label>
        </div>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="consentAi"
            checked={consentAi}
            onCheckedChange={(v) => onConsentAiChange(v === true)}
          />
          <Label htmlFor="consentAi" className="text-sm font-normal leading-snug">
            I understand my answers will be processed by an AI service to build my career path.
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={isSaving || !consentPrivacy || !consentAi}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
