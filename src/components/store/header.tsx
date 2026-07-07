import Link from "next/link";
import { eq } from "drizzle-orm";
import { Menu, User } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { SearchTrigger } from "./search-trigger";
import { CartTrigger } from "./cart-trigger";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const [profile] = await getDb()
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id));
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-safe backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <div className="flex flex-1 items-center lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="size-11"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="gap-0 border-none p-0 data-[side=left]:w-full data-[side=left]:sm:max-w-none"
            >
              <SheetHeader className="flex-row items-center justify-between border-b border-border pt-safe">
                <SheetTitle className="kicker">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={link.href}
                        className="border-b border-border py-4 text-2xl tracking-tight"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col px-4 pb-safe">
                {isAdmin && (
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/admin"
                        className="border-t border-border py-4 text-2xl tracking-tight"
                      />
                    }
                  >
                    Admin
                  </SheetClose>
                )}
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href={user ? "/account" : "/auth/login"}
                      className="kicker py-4 text-muted-foreground"
                    />
                  }
                >
                  Account
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="kicker text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="kicker text-foreground/70 transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Icon actions */}
        <div className="flex flex-1 items-center justify-end gap-0.5">
          <SearchTrigger />
          <Link
            href={user ? "/account" : "/auth/login"}
            aria-label="Account"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "size-11 lg:size-9",
            })}
          >
            <User className="size-5" />
          </Link>
          <CartTrigger />
        </div>
      </div>
    </header>
  );
}
