'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  downloadMyData,
  useChangePassword,
  useDeleteAccount,
  useRemoveSkill,
  useStudentMe,
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/use-profile';
import { useGenerateCareerPath } from '@/hooks/use-career-path';
import { StudentProfile } from '@/types/models';
import { useRouter } from 'next/navigation';

type ProfileFormValues = Pick<
  StudentProfile,
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'city'
  | 'country'
  | 'university'
  | 'degreeLevel'
  | 'fieldOfStudy'
  | 'bio'
  | 'linkedinUrl'
  | 'githubUrl'
  | 'portfolioUrl'
>;

export default function ProfilePage() {
  const { data, isLoading } = useStudentMe();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeSkill = useRemoveSkill();
  const generatePath = useGenerateCareerPath();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    values: data?.profile
      ? {
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          phone: data.profile.phone,
          city: data.profile.city,
          country: data.profile.country,
          university: data.profile.university,
          degreeLevel: data.profile.degreeLevel,
          fieldOfStudy: data.profile.fieldOfStudy,
          bio: data.profile.bio,
          linkedinUrl: data.profile.linkedinUrl,
          githubUrl: data.profile.githubUrl,
          portfolioUrl: data.profile.portfolioUrl,
        }
      : undefined,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success('Profile updated'),
      onError: (error) => toast.error(error.message || 'Could not update profile'),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={data.profile.avatarUrl ?? undefined} />
          <AvatarFallback>{(data.profile.firstName ?? data.email)[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {data.profile.firstName} {data.profile.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{data.email}</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => fileInput.current?.click()}
            disabled={uploadAvatar.isPending}
          >
            Change photo
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar.mutate(file);
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (E.164)</Label>
                <Input id="phone" placeholder="+355691234567" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" {...register('university')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of study</Label>
                <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input id="linkedinUrl" {...register('linkedinUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input id="githubUrl" {...register('githubUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio</Label>
                <Input id="portfolioUrl" {...register('portfolioUrl')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} {...register('bio')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Manage the skills you added during onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <Badge
              key={s.id}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => removeSkill.mutate(s.skillId)}
            >
              {s.skill.name} ({s.level}/5) ×
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Career path</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" render={<Link href="/onboarding/1">Edit onboarding answers</Link>} />
          <Button
            variant="outline"
            onClick={() =>
              generatePath.mutate(undefined, {
                onSuccess: () => {
                  toast.success('Regenerating your career path');
                  router.push('/career-path');
                },
                onError: (error) => toast.error(error.message),
              })
            }
            disabled={generatePath.isPending}
          >
            Regenerate career path
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordCard />

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => downloadMyData()}>
            Download my data
          </Button>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordCard() {
  const changePassword = useChangePassword();
  const { register, handleSubmit, reset } = useForm<{ currentPassword: string; newPassword: string }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) =>
            changePassword.mutate(values, {
              onSuccess: () => {
                toast.success('Password changed');
                reset();
              },
              onError: (error) => toast.error(error.message),
            })
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword', { required: true, minLength: 10 })}
              />
            </div>
          </div>
          <Button type="submit" disabled={changePassword.isPending}>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteAccountDialog() {
  const deleteAccount = useDeleteAccount();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Delete my account</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently anonymises your account and removes your profile, skills and career
            paths. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteAccount.mutate(undefined, {
                onSuccess: () => router.replace('/login'),
              })
            }
            disabled={deleteAccount.isPending}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
