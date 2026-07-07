import Image from "next/image";
import Link from "next/link";

import { siteMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

// Intrinsic size of the source wordmark (tightly cropped, transparent bg) —
// only used so next/image can compute the right aspect ratio. Actual
// rendered size is controlled by the `className` height each call site
// passes in (e.g. h-4), with width following automatically.
const LOGO_WIDTH = 104;
const LOGO_HEIGHT = 43;

const LOGO_SRC = {
  // Black wordmark — default, for light/white backgrounds (footer, auth,
  // the header once it's past the transparent-over-hero state).
  dark: siteMedia("website_pics/logo.png"),
  // White wordmark — for dark/overlay contexts (header atop the hero).
  light: siteMedia("website_pics/logo-white.png"),
} as const;

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Link href="/" aria-label="Dubyssa — Home" className="inline-flex">
      <Image
        src={LOGO_SRC[variant]}
        alt="Dubyssa"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className={cn("h-4 w-auto object-contain", className)}
      />
    </Link>
  );
}
