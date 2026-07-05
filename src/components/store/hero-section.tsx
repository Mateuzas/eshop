import Link from "next/link";

import { PlaceholderImage } from "./placeholder-image";

export function HeroSection() {
  return (
    <section className="relative h-[92svh] min-h-[560px] w-full">
      <PlaceholderImage
        className="absolute inset-0"
        label="Hero photography"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-10 lg:p-14">
        <span className="kicker text-foreground/70">
          Fall / Winter Collection
        </span>
        <h1 className="heading-display max-w-2xl">
          Built for the in-between seasons.
        </h1>
        <Link
          href="/products"
          className="kicker w-fit border-b border-foreground pb-1 text-foreground transition-opacity hover:opacity-60"
        >
          Shop the Collection
        </Link>
      </div>
    </section>
  );
}
