"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type ActionResult =
  | { error: string }
  | { error?: undefined; needsConfirmation: true }
  | undefined;

function safeRedirectPath(redirectTo: string | undefined) {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }
  // `/account` doesn't exist yet (a later phase), so fall back to the
  // homepage rather than sending users to a 404 right after signing in.
  return "/";
}

export async function login(
  values: { email: string; password: string },
  redirectTo?: string
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Invalid email or password."
          : error.message,
    };
  }

  redirect(safeRedirectPath(redirectTo));
}

export async function signup(
  values: { email: string; password: string; fullName: string },
  redirectTo?: string
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes("already registered")
        ? "An account with this email already exists."
        : error.message,
    };
  }

  // No session means the project requires email confirmation before sign-in.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect(safeRedirectPath(redirectTo));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
