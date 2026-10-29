'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEGREE_LEVELS, CEFR_LEVELS } from './options';
import { Plus, X } from 'lucide-react';

export interface Step1Values {
  fieldOfStudy: string;
  degreeLevel: string;
  university: string;
  graduationYear: number;
  gpa?: number;
  notableProjects?: string;
  languages?: { language: string; level: string }[];
}

export function Step1Studies({
  defaultValues,
  onSubmit,
  isSaving,
}: {
  defaultValues?: Partial<Step1Values>;
  onSubmit: (values: Step1Values) => void;
  isSaving: boolean;
}) {
  const { register, handleSubmit, control } = useForm<Step1Values>({
    defaultValues: {
      fieldOfStudy: defaultValues?.fieldOfStudy ?? '',
      degreeLevel: defaultValues?.degreeLevel ?? 'Bachelor',
      university: defaultValues?.university ?? '',
      graduationYear: defaultValues?.graduationYear ?? new Date().getFullYear(),
      gpa: defaultValues?.gpa,
      notableProjects: defaultValues?.notableProjects ?? '',
      languages: defaultValues?.languages ?? [{ language: 'English', level: 'B2' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'languages' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fieldOfStudy">Field of study</Label>
          <Input id="fieldOfStudy" placeholder="e.g. Computer Science" {...register('fieldOfStudy', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>Degree level</Label>
          <Controller
            control={control}
            name="degreeLevel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_LEVELS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input id="university" {...register('university', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="graduationYear">Graduation year</Label>
          <Input
            id="graduationYear"
            type="number"
            {...register('graduationYear', { required: true, valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA (optional, out of 4.0)</Label>
          <Input id="gpa" type="number" step="0.01" {...register('gpa', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notableProjects">Notable projects or thesis (optional)</Label>
        <Textarea id="notableProjects" maxLength={800} rows={3} {...register('notableProjects')} />
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input placeholder="Language" {...register(`languages.${index}.language`)} className="flex-1" />
              <select
                className="h-11 w-24 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-[color,box-shadow,border-color,background-color] duration-150 hover:border-ring/50 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/50"
                {...register(`languages.${index}.level`)}
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ language: '', level: 'B1' })}
          >
            <Plus className="mr-1 h-4 w-4" /> Add language
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}
