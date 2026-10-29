'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSkills } from '@/hooks/use-skills';
import { useCourses, useCreateCourse, useDeleteCourse } from '@/hooks/use-courses';
import { CourseFormat, CourseLevel } from '@/types/enums';

export default function CatalogPage() {
  const { data: skills } = useSkills();
  const { data: courses } = useCourses();
  const deleteCourse = useDeleteCourse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="skills" className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            The skills taxonomy is shared and read-only.
          </p>
          <div className="flex flex-wrap gap-2">
            {(skills ?? []).map((s) => (
              <Badge key={s.id} variant="outline">
                {s.name}
              </Badge>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="courses" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <NewCourseDialog />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(courses ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.provider}</TableCell>
                    <TableCell>{c.format}</TableCell>
                    <TableCell>{c.estimatedHours}h</TableCell>
                    <TableCell>
                      <Badge variant={c.companyId ? 'secondary' : 'outline'}>
                        {c.companyId ? 'Company' : 'Global'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.companyId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteCourse.mutate(c.id, {
                              onError: (e) => toast.error(e.message),
                            })
                          }
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewCourseDialog() {
  const { data: skills } = useSkills();
  const createCourse = useCreateCourse();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<CourseFormat>(CourseFormat.VIDEO);
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [hours, setHours] = useState(10);
  const [skillId, setSkillId] = useState('');

  const reset = () => {
    setTitle('');
    setProvider('');
    setUrl('');
    setHours(10);
    setSkillId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>New course</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New course</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Provider</Label>
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => v && setFormat(v as CourseFormat)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CourseFormat).map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Level</Label>
              <Select value={level} onValueChange={(v) => v && setLevel(v as CourseLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CourseLevel).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Estimated hours</Label>
            <Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label>Primary skill</Label>
            <Select value={skillId} onValueChange={(v) => v && setSkillId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a skill" />
              </SelectTrigger>
              <SelectContent>
                {(skills ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            disabled={!title || !provider || !url || !skillId || createCourse.isPending}
            onClick={() =>
              createCourse.mutate(
                {
                  title,
                  provider,
                  url,
                  format,
                  level,
                  estimatedHours: hours,
                  skills: [{ skillId, levelGained: 3 }],
                },
                {
                  onSuccess: () => {
                    toast.success('Course created');
                    reset();
                    setOpen(false);
                  },
                  onError: (e) => toast.error(e.message),
                }
              )
            }
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
