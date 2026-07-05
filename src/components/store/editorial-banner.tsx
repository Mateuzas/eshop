import Link from "next/link";

import { cn } from "@/lib/utils";
import { PlaceholderImage } from "./placeholder-image";

type EditorialBannerProps = {
  kicker: string;
  heading: string;
  body?: string;
  cta: string;
  href: string;
  imageSide?: "left" | "right";
};

export function EditorialBanner({
  kicker,
  heading,
  body,
  cta,
  href,
  imageSide = "left",
}: EditorialBannerProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div
        className={cn(
          "relative aspect-4/5 md:aspect-auto",
          imageSide === "right" && "md:order-2"
        )}
      >
        <PlaceholderImage
          className="absolute inset-0"
          label="Editorial photography"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 px-6 py-16 sm:px-10 md:px-14 lg:px-20">
        <span className="kicker text-muted-foreground">{kicker}</span>
        <h2 className="heading-display max-w-md text-3xl sm:text-4xl md:text-5xl">
          {heading}
        </h2>
        {body && (
          <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
        )}
        <Link
          href={href}
          className="kicker w-fit border-b border-foreground pb-1 transition-opacity hover:opacity-60"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
