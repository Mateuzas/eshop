import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="EShop — Home"
      className={cn(
        "font-optima text-base font-medium tracking-[0.3em] uppercase",
        className
      )}
    >
      EShop
    </Link>
  );
}
