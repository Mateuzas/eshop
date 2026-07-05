"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { signup } from "@/app/auth/actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_FORM: RegisterInput = { email: "", password: "", fullName: "" };

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [form, setForm] = useState<RegisterInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  function updateField(field: keyof RegisterInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RegisterInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await signup(parsed.data, redirectTo);
      if (!result) return;
      if ("needsConfirmation" in result) {
        setNeedsConfirmation(true);
        return;
      }
      toast.error(result.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Check your email to confirm your account before signing in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={cn(buttonVariants({ size: "cta" }), "mt-2 w-full")}
      >
        {submitting ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
