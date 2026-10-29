'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SITUATIONAL_QUESTIONS } from './options';
import { cn, firstOf } from '@/lib/utils';

const SELF_RATING_FIELDS = [
  ['communication', 'Communication'],
  ['teamwork', 'Teamwork'],
  ['leadership', 'Leadership'],
  ['problemSolving', 'Problem solving'],
  ['timeManagement', 'Time management'],
  ['adaptability', 'Adaptability'],
  ['creativity', 'Creativity'],
] as const;

export interface Step4Values {
  communication: number;
  teamwork: number;
  leadership: number;
  problemSolving: number;
  timeManagement: number;
  adaptability: number;
  creativity: number;
  conflictAnswer: 'A' | 'B' | 'C' | 'D';
  deadlineAnswer: 'A' | 'B' | 'C' | 'D';
  feedbackAnswer: 'A' | 'B' | 'C' | 'D';
}

export function Step4SoftSkills({
  defaultValues,
  onSubmit,
  isSaving,
}: {
  defaultValues?: Partial<Step4Values>;
  onSubmit: (values: Step4Values) => void;
  isSaving: boolean;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const [key] of SELF_RATING_FIELDS) init[key] = (defaultValues?.[key] as number) ?? 3;
    return init;
  });
  const [answers, setAnswers] = useState<Record<string, string>>({
    conflictAnswer: defaultValues?.conflictAnswer ?? '',
    deadlineAnswer: defaultValues?.deadlineAnswer ?? '',
    feedbackAnswer: defaultValues?.feedbackAnswer ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(answers).some((v) => !v)) {
      setError('Please answer all three situational questions');
      return;
    }
    setError(null);
    onSubmit({
      communication: ratings.communication,
      teamwork: ratings.teamwork,
      leadership: ratings.leadership,
      problemSolving: ratings.problemSolving,
      timeManagement: ratings.timeManagement,
      adaptability: ratings.adaptability,
      creativity: ratings.creativity,
      conflictAnswer: answers.conflictAnswer as Step4Values['conflictAnswer'],
      deadlineAnswer: answers.deadlineAnswer as Step4Values['deadlineAnswer'],
      feedbackAnswer: answers.feedbackAnswer as Step4Values['feedbackAnswer'],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label>Rate yourself (1 = developing, 5 = strong)</Label>
        {SELF_RATING_FIELDS.map(([key, label]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="w-40 flex-shrink-0 text-sm">{label}</span>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[ratings[key]]}
              onValueChange={(v) => setRatings((r) => ({ ...r, [key]: firstOf(v) }))}
              className="flex-1"
            />
            <span className="w-8 flex-shrink-0 text-right text-sm text-muted-foreground">
              {ratings[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <Label>A few quick scenarios</Label>
        {SITUATIONAL_QUESTIONS.map((q) => (
          <div key={q.key} className="space-y-2">
            <p className="text-sm font-medium">{q.prompt}</p>
            <div className="space-y-1.5">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-[border-color,background-color,transform] duration-150 hover:border-ring/50 hover:bg-accent/30 active:scale-[0.99]',
                    answers[q.key] === opt.value && 'border-primary bg-primary/5'
                  )}
                >
                  <input
                    type="radio"
                    name={q.key}
                    value={opt.value}
                    checked={answers[q.key] === opt.value}
                    onChange={() => setAnswers((a) => ({ ...a, [q.key]: opt.value }))}
                    className="mt-1 size-4 accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
