import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="kicker text-muted-foreground">Join us</span>
        <h1 className="heading-display text-3xl">Create Account</h1>
      </div>

      <RegisterForm redirectTo={redirect} />
    </div>
  );
}
