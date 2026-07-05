import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="kicker text-muted-foreground">Welcome back</span>
        <h1 className="heading-display text-3xl">Sign In</h1>
      </div>

      <LoginForm redirectTo={redirect} />
    </div>
  );
}
