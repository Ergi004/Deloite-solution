'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagListInput } from './tag-list-input';
import { firstOf } from '@/lib/utils';
import { useSkills } from '@/hooks/use-skills';
import { UpsertJobInput, JobSkillInput } from '@/hooks/use-jobs';
import { Seniority, WorkMode } from '@/types/enums';
import { ROLE_FAMILY_OPTIONS } from '@/components/onboarding/options';

export function JobForm({
  defaultValues,
  onSubmit,
  isSaving,
  submitLabel = 'Save as draft',
}: {
  defaultValues?: Partial<UpsertJobInput>;
  onSubmit: (values: UpsertJobInput) => void;
  isSaving: boolean;
  submitLabel?: string;
}) {
  const { data: allSkills } = useSkills();

  const [code, setCode] = useState(defaultValues?.code ?? '');
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [department, setDepartment] = useState(defaultValues?.department ?? '');
  const [roleFamily, setRoleFamily] = useState(defaultValues?.roleFamily ?? ROLE_FAMILY_OPTIONS[0]);
  const [industry, setIndustry] = useState(defaultValues?.industry ?? '');
  const [seniority, setSeniority] = useState(defaultValues?.seniority ?? Seniority.JUNIOR);
  const [location, setLocation] = useState(defaultValues?.location ?? '');
  const [workMode, setWorkMode] = useState(defaultValues?.workMode ?? WorkMode.HYBRID);
  const [salaryMin, setSalaryMin] = useState(defaultValues?.salaryMin ?? 0);
  const [salaryMax, setSalaryMax] = useState(defaultValues?.salaryMax ?? 0);
  const [openings, setOpenings] = useState(defaultValues?.openings ?? 1);

  const [summary, setSummary] = useState(defaultValues?.summary ?? '');
  const [responsibilities, setResponsibilities] = useState<string[]>(
    defaultValues?.responsibilities ?? []
  );
  const [niceToHave, setNiceToHave] = useState<string[]>(defaultValues?.niceToHaveSkills ?? []);
  const [tools, setTools] = useState<string[]>(defaultValues?.toolsAndTech ?? []);
  const [educationRequirement, setEducationRequirement] = useState(
    defaultValues?.educationRequirement ?? ''
  );
  const [minYearsExperience, setMinYearsExperience] = useState(
    defaultValues?.minYearsExperience ?? 0
  );
  const [languages, setLanguages] = useState<string[]>(defaultValues?.languages ?? ['English']);
  const [softSkills, setSoftSkills] = useState<string[]>(defaultValues?.softSkillRequirements ?? []);
  const [monthsToProductivity, setMonthsToProductivity] = useState(
    defaultValues?.monthsToProductivity ?? 3
  );
  const [promotionCriteria, setPromotionCriteria] = useState<string[]>(
    defaultValues?.promotionCriteria ?? []
  );
  const [reportsTo, setReportsTo] = useState(defaultValues?.reportsTo ?? '');
  const [teamSize, setTeamSize] = useState(defaultValues?.teamSize ?? 0);

  const [skills, setSkills] = useState<JobSkillInput[]>(defaultValues?.skills ?? []);
  const [skillToAdd, setSkillToAdd] = useState('');

  const addSkill = () => {
    if (!skillToAdd || skills.some((s) => s.skillId === skillToAdd)) return;
    setSkills([...skills, { skillId: skillToAdd, minLevel: 2, weight: 3, isRequired: true }]);
    setSkillToAdd('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      title,
      department,
      roleFamily,
      industry,
      seniority,
      location,
      workMode,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
      salaryCurrency: 'EUR',
      openings,
      summary,
      responsibilities,
      niceToHaveSkills: niceToHave.length ? niceToHave : undefined,
      toolsAndTech: tools,
      educationRequirement,
      minYearsExperience,
      languages,
      softSkillRequirements: softSkills,
      monthsToProductivity,
      promotionCriteria,
      reportsTo: reportsTo || undefined,
      teamSize: teamSize || undefined,
      skills,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Role family</Label>
            <Select value={roleFamily} onValueChange={(v) => v && setRoleFamily(v)}>
              <SelectTrigger className="w-full">
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
            <Label>Industry</Label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Seniority</Label>
            <Select value={seniority} onValueChange={(v) => v && setSeniority(v as Seniority)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Seniority).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location and contract</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tirana, Albania"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Work mode</Label>
            <Select value={workMode} onValueChange={(v) => v && setWorkMode(v as WorkMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(WorkMode).map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Salary min (EUR)</Label>
            <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Salary max (EUR)</Label>
            <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Openings</Label>
            <Input type="number" min={1} value={openings} onChange={(e) => setOpenings(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required />
          </div>
          <TagListInput
            label="Responsibilities (aim for 6-8)"
            values={responsibilities}
            onChange={setResponsibilities}
          />
          <TagListInput label="Tools and technologies" values={tools} onChange={setTools} />
          <TagListInput label="Languages" values={languages} onChange={setLanguages} />
          <TagListInput
            label="Soft skill requirements"
            values={softSkills}
            onChange={setSoftSkills}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills (minimum level and weight)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={skillToAdd} onValueChange={(v) => v && setSkillToAdd(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a skill to add" />
              </SelectTrigger>
              <SelectContent>
                {(allSkills ?? [])
                  .filter((s) => !skills.some((js) => js.skillId === s.id))
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {skills.map((s, idx) => {
              const skillInfo = allSkills?.find((as) => as.id === s.skillId);
              return (
                <div key={s.skillId} className="flex items-center gap-4 rounded-md border p-3">
                  <span className="w-40 flex-shrink-0 text-sm font-medium">{skillInfo?.name}</span>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">Min level: {s.minLevel}</span>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[s.minLevel]}
                      onValueChange={(val) => {
                        const next = [...skills];
                        next[idx] = { ...s, minLevel: firstOf(val) };
                        setSkills(next);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">Weight: {s.weight}</span>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[s.weight]}
                      onValueChange={(val) => {
                        const next = [...skills];
                        next[idx] = { ...s, weight: firstOf(val) };
                        setSkills(next);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={s.isRequired}
                      onCheckedChange={(v) => {
                        const next = [...skills];
                        next[idx] = { ...s, isRequired: v === true };
                        setSkills(next);
                      }}
                    />
                    <span className="text-xs">Required</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Education and experience</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Education requirement</Label>
            <Input
              value={educationRequirement}
              onChange={(e) => setEducationRequirement(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum years of experience</Label>
            <Input
              type="number"
              step="0.5"
              value={minYearsExperience}
              onChange={(e) => setMinYearsExperience(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Months to productivity</Label>
            <Input
              type="number"
              value={monthsToProductivity}
              onChange={(e) => setMonthsToProductivity(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Reports to</Label>
            <Input value={reportsTo} onChange={(e) => setReportsTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Team size</Label>
            <Input type="number" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression and nice-to-haves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagListInput
            label="Promotion criteria (aim for 3-5)"
            values={promotionCriteria}
            onChange={setPromotionCriteria}
          />
          <TagListInput
            label="Nice-to-have skills (names, for display only)"
            values={niceToHave}
            onChange={setNiceToHave}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
