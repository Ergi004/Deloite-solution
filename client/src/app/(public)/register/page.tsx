"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandMark } from "@/components/layout/brand-mark";
import { api } from "@/lib/api";
import { PublicUser } from "@/types/models";

interface ValidationResponse {
  valid: boolean;
  reason?: "invalid" | "expired" | "used";
  companyName?: string;
  emailLocked?: string | null;
}

const schema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(10, "Password must be at least 10 characters"),
    confirmPassword: z.string(),
    consentPrivacy: z.literal(true, {
      message: "You must accept the privacy policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  // An invite token is optional. If one is present in the URL we still validate and honour
  // it (locked email, single-use), but it is never required to create an account.
  const token = params.get("token") ?? "";

  const validation = useQuery<ValidationResponse>({
    queryKey: ["invitation-validate", token],
    queryFn: () =>
      api.get<ValidationResponse>(
        `/invitations/validate?token=${encodeURIComponent(token)}`,
      ),
    enabled: Boolean(token),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [passwordScore, setPasswordScore] = useState(0);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post<PublicUser>("/auth/register", {
        token: token || undefined,
        email: values.email,
        password: values.password,
        consentPrivacy: values.consentPrivacy,
      }),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
      router.push("/onboarding/1");
    },
    onError: (error) => toast.error(error.message || "Could not register"),
  });

  useEffect(() => {
    if (!token || validation.isLoading || validation.data?.valid) return;
    const reason = validation.data?.reason;
    const message =
      reason === "expired"
        ? "This invitation link has expired. You can still create an account below without it."
        : reason === "used"
          ? "This invitation link has already been used. You can still create an account below without it."
          : "This invitation link is not valid, but you can still create an account below.";
    toast.message(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, validation.isLoading, validation.data?.valid]);

  if (token && validation.isLoading) {
    return (
      <AuthMessageCard title="Checking your invitation…">
        One moment.
      </AuthMessageCard>
    );
  }

  const emailLocked =
    token && validation.data?.valid ? validation.data.emailLocked : null;
  const companyName =
    token && validation.data?.valid ? validation.data.companyName : null;

  return (
    <div className="w-full max-w-md">
      <BrandMark />
      <Card className="shadow-tint-md border-border/60">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            {companyName ? (
              <>
                You&apos;ve been invited by <strong>{companyName}</strong>
              </>
            ) : (
              "Sign up to start your career path"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                readOnly={Boolean(emailLocked)}
                defaultValue={emailLocked ?? ""}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                onChange={(e) => {
                  setValue("password", e.target.value);
                  setPasswordScore(scorePassword(e.target.value));
                }}
              />
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(passwordScore / 4) * 100}%` }}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="consentPrivacy"
                onCheckedChange={(v) =>
                  setValue("consentPrivacy", (v === true) as true)
                }
              />
              <Label
                htmlFor="consentPrivacy"
                className="text-sm font-normal leading-tight"
              >
                I agree to the{" "}
                <a href="/privacy" target="_blank" className="underline">
                  privacy policy
                </a>{" "}
                and understand my onboarding answers will be processed by an AI
                service to build my career path.
              </Label>
            </div>
            {errors.consentPrivacy && (
              <p className="text-sm text-destructive">
                {errors.consentPrivacy.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="underline">
              Log in
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function AuthMessageCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
