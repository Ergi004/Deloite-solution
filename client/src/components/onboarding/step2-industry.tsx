'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { INTEREST_OPTIONS, DAY_TO_DAY_OPTIONS } from './options';

export interface Step2Values {
  preferredIndustry: string;
  interests: string[];
  dayToDayPreferences: string[];
  dayToDayOther?: string;
}

function ChipPicker({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <Badge
          key={opt}
          variant={selected.includes(opt) ? 'default' : 'outline'}
          className={cn(
            'h-9 cursor-pointer select-none px-4 py-2 text-sm transition-transform duration-150 [@media(hover:hover)]:hover:scale-105 active:scale-95'
          )}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </Badge>
      ))}
    </div>
  );
}

export function Step2Industry({
  industries,
  defaultValues,
  onSubmit,
  isSaving,
}: {
  industries: string[];
  defaultValues?: Partial<Step2Values>;
  onSubmit: (values: Step2Values) => void;
  isSaving: boolean;
}) {
  const [preferredIndustry, setPreferredIndustry] = useState(
    defaultValues?.preferredIndustry ?? industries[0] ?? ''
  );
  const [interests, setInterests] = useState<string[]>(defaultValues?.interests ?? []);
  const [dayToDay, setDayToDay] = useState<string[]>(defaultValues?.dayToDayPreferences ?? []);
  const [other, setOther] = useState(defaultValues?.dayToDayOther ?? '');
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length < 3 || interests.length > 8) {
      setError('Pick between 3 and 8 interests');
      return;
    }
    setError(null);
    onSubmit({
      preferredIndustry,
      interests,
      dayToDayPreferences: dayToDay,
      dayToDayOther: other || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Which industry at the company interests you most?</Label>
        <Select value={preferredIndustry} onValueChange={(v) => v && setPreferredIndustry(v)}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {industries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>What are you interested in? (pick 3-8)</Label>
        <ChipPicker
          options={INTEREST_OPTIONS}
          selected={interests}
          onToggle={(v) => toggle(interests, setInterests, v)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label>What do you enjoy doing day to day?</Label>
        <ChipPicker
          options={DAY_TO_DAY_OPTIONS}
          selected={dayToDay}
          onToggle={(v) => toggle(dayToDay, setDayToDay, v)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dayToDayOther">Anything else? (optional)</Label>
        <Textarea
          id="dayToDayOther"
          maxLength={500}
          rows={3}
          value={other}
          onChange={(e) => setOther(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
