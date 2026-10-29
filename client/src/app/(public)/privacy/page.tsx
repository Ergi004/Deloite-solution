import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <Card className="shadow-tint-md border-border/60 w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Privacy policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          This is a demo build of DeloitteElevate. Your onboarding answers (studies, skills,
          interests, goals) are stored by your employer and used to build a personalised career
          path inside your company&apos;s real jobs and course catalogue.
        </p>
        <p>
          When you generate a career path, a sanitised summary of your profile is sent to
          Google&apos;s Gemini API to produce the plan. Free-text answers are truncated and
          contact details are never included in that request.
        </p>
        <p>
          You can edit your profile, download a copy of your data, or delete your account at any
          time from your profile page.
        </p>
      </CardContent>
    </Card>
  );
}
