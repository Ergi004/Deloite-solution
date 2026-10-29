'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ONBOARDING_STEP_TITLES } from '@/types/enums';
import { OnboardingOptionSkill } from '@/hooks/use-onboarding';
import { Step1Values } from './step1-studies';
import { Step2Values } from './step2-industry';
import { Step3Values, LEVEL_LABELS } from './step3-skills';
import { Step4Values } from './step4-soft-skills';
import { Step5Values } from './step5-career-direction';
import { Step6Values } from './step6-goals';
import { SITUATIONAL_QUESTIONS, TRACK_PREFERENCE_OPTIONS } from './options';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="grid gap-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function PillList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function SummaryCard({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-semibold">{ONBOARDING_STEP_TITLES[step]}</CardTitle>
        <Link
          href={`/onboarding/${step}`}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Edit
        </Link>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2.5">{children}</dl>
      </CardContent>
    </Card>
  );
}

export function Step7Review({
  responses,
  skills,
  consentPrivacy,
  consentAi,
  onGenerate,
  isSubmitting,
}: {
  responses: Record<number, Record<string, unknown>>;
  skills: OnboardingOptionSkill[];
  consentPrivacy: boolean;
  consentAi: boolean;
  onGenerate: () => void;
  isSubmitting: boolean;
}) {
  const r1 = (responses[1] ?? {}) as Partial<Step1Values>;
  const r2 = (responses[2] ?? {}) as Partial<Step2Values>;
  const r3 = (responses[3] ?? {}) as Partial<Step3Values>;
  const r4 = (responses[4] ?? {}) as Partial<Step4Values>;
  const r5 = (responses[5] ?? {}) as Partial<Step5Values>;
  const r6 = (responses[6] ?? {}) as Partial<Step6Values>;

  const skillNames = (r3.skills ?? []).map((s) => {
    const skill = skills.find((sk) => sk.id === s.skillId);
    return `${skill?.name ?? 'Unknown skill'} — ${LEVEL_LABELS[s.level] ?? s.level}`;
  });

  const ratingFields: [string, number | undefined][] = [
    ['Communication', r4.communication],
    ['Teamwork', r4.teamwork],
    ['Leadership', r4.leadership],
    ['Problem solving', r4.problemSolving],
    ['Time management', r4.timeManagement],
    ['Adaptability', r4.adaptability],
    ['Creativity', r4.creativity],
  ];

  const answerLabel = (key: (typeof SITUATIONAL_QUESTIONS)[number]['key'], value?: string) =>
    SITUATIONAL_QUESTIONS.find((q) => q.key === key)?.options.find((o) => o.value === value)
      ?.label;

  const consentReady = consentPrivacy && consentAi;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Review your answers</h3>
        <p className="text-sm text-muted-foreground">
          Here&apos;s everything you told us. Use &ldquo;Edit&rdquo; on any card to go back and change it.
        </p>
      </div>

      <SummaryCard step={1}>
        <Field label="Field of study" value={r1.fieldOfStudy} />
        <Field label="Degree level" value={r1.degreeLevel} />
        <Field label="University" value={r1.university} />
        <Field label="Graduation year" value={r1.graduationYear} />
        <Field label="GPA" value={r1.gpa} />
        <Field label="Notable projects" value={r1.notableProjects} />
        <Field
          label="Languages"
          value={
            r1.languages?.length ? (
              <PillList items={r1.languages.map((l) => `${l.language} (${l.level})`)} />
            ) : undefined
          }
        />
      </SummaryCard>

      <SummaryCard step={2}>
        <Field label="Preferred industry" value={r2.preferredIndustry} />
        <Field label="Interests" value={<PillList items={r2.interests} />} />
        <Field label="Day-to-day" value={<PillList items={r2.dayToDayPreferences} />} />
        <Field label="Anything else" value={r2.dayToDayOther} />
      </SummaryCard>

      <SummaryCard step={3}>
        <Field label="Skills" value={<PillList items={skillNames} />} />
        <Field label="Certifications" value={<PillList items={r3.certifications} />} />
      </SummaryCard>

      <SummaryCard step={4}>
        <Field
          label="Self-rating"
          value={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {ratingFields
                .filter(([, v]) => v !== undefined)
                .map(([label, v]) => (
                  <span key={label} className="text-sm">
                    {label}: <span className="font-medium">{v}/5</span>
                  </span>
                ))}
            </div>
          }
        />
        <Field label="Handling disagreement" value={answerLabel('conflictAnswer', r4.conflictAnswer)} />
        <Field label="At-risk deadline" value={answerLabel('deadlineAnswer', r4.deadlineAnswer)} />
        <Field label="Receiving feedback" value={answerLabel('feedbackAnswer', r4.feedbackAnswer)} />
      </SummaryCard>

      <SummaryCard step={5}>
        <Field label="Role family" value={r5.roleFamily} />
        <Field label="Target role" value={r5.targetRole} />
        <Field
          label="Track preference"
          value={TRACK_PREFERENCE_OPTIONS.find((t) => t.value === r5.trackPreference)?.label}
        />
      </SummaryCard>

      <SummaryCard step={6}>
        <Field
          label="Timeline"
          value={r6.targetHorizonYears ? `${r6.targetHorizonYears} year${r6.targetHorizonYears > 1 ? 's' : ''}` : undefined}
        />
        <Field label="Target level" value={r6.targetLevel} />
        <Field label="Goal" value={r6.goalStatement} />
        <Field
          label="Weekly learning"
          value={r6.weeklyLearningHours ? `${r6.weeklyLearningHours}h/week` : undefined}
        />
        <Field label="What matters to you" value={<PillList items={r6.expectations} />} />
        <Field label="Salary expectation" value={r6.salaryExpectationBand} />
      </SummaryCard>

      <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
        {consentReady ? (
          <>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">
              You agreed to our{' '}
              <a href="/privacy" target="_blank" className="text-primary underline underline-offset-2">
                privacy policy
              </a>{' '}
              and AI processing in the previous step.
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            You still need to agree to our privacy policy and AI processing before we can
            generate your path. Head back to{' '}
            <Link href="/onboarding/6" className="text-primary underline underline-offset-2">
              step 6
            </Link>{' '}
            to confirm.
          </span>
        )}
      </div>

      <Button
        size="lg"
        disabled={!consentReady || isSubmitting}
        onClick={onGenerate}
      >
        {isSubmitting ? 'Generating…' : 'Generate my career path'}
      </Button>
    </div>
  );
}
