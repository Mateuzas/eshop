import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AccountPage() {
  // `src/proxy.ts` already redirects unauthenticated visitors away from
  // `/account`; this is just a fallback so the page never renders signed out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
      <h1 className="heading-display text-3xl sm:text-4xl">Account</h1>

      <div className="mt-10 flex flex-col gap-1.5 border-b border-border pb-6">
        <span className="kicker text-muted-foreground">Signed in as</span>
        <p className="text-sm">{user.email}</p>
      </div>

      <form action={logout} className="mt-6">
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
