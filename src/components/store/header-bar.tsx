"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { SearchTrigger } from "./search-trigger";
import { CartTrigger } from "./cart-trigger";

// Below this scroll offset the header always stays put (this is "the very
// top" of any page) regardless of scroll direction — past it, the header
// hides on scroll-down and reveals on scroll-up.
const TOP_THRESHOLD = 8;

export function HeaderBar({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const atTop = currentY < TOP_THRESHOLD;
      const scrollingDown = currentY > lastScrollY.current;

      if (atTop) {
        setHidden(false);
      } else if (scrollingDown) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 w-full bg-[#1a1c1d] pt-safe transition-transform duration-300",
        hidden && "-translate-y-full"
      )}
    >
      <div className="flex h-9 w-full items-center px-4 sm:h-10 sm:px-6 lg:px-10 xl:px-14">
        {/* Left: mobile menu trigger / desktop nav */}
        <div className="flex flex-1 items-center gap-8">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="size-11 text-white hover:bg-transparent hover:text-white/70 lg:hidden"
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
                      href={isLoggedIn ? "/account" : "/auth/login"}
                      className="kicker py-4 text-muted-foreground"
                    />
                  }
                >
                  Account
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="kicker text-white/70 transition-opacity hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="kicker text-white/70 transition-opacity hover:text-white"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Center: logo, a real flex child so it can never overlap the side content */}
        <Logo
          variant="light"
          className="h-8 w-12 shrink-0 object-fill sm:h-12 sm:w-30"
        />

        {/* Right: text actions */}
        <div className="flex flex-1 items-center justify-end gap-1 text-white lg:gap-6">
          <SearchTrigger className="text-white" />
          <Link
            href={isLoggedIn ? "/account" : "/auth/login"}
            className="kicker hidden h-11 items-center px-3 transition-opacity hover:opacity-60 lg:flex lg:h-auto lg:px-0"
          >
            Account
          </Link>
          <CartTrigger className="text-white" />
        </div>
      </div>
    </header>
  );
}
