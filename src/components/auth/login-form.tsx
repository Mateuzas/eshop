"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { login } from "@/app/auth/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_FORM: LoginInput = { email: "", password: "" };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [form, setForm] = useState<LoginInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof LoginInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await login(parsed.data, redirectTo);
      if (result?.error) {
        toast.error(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          autoComplete="current-password"
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
        {submitting ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
