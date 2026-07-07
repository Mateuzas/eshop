import Image from "next/image";
import Link from "next/link";

import { siteMedia } from "@/lib/media";

export function HeroSection() {
  return (
    <section className="relative h-[92svh] min-h-[560px] w-full">
      <Image
        src={siteMedia("website_pics/dubyssa_1736428552_3541741862445442335_2289332988.jpg")}
        alt="Fall / Winter Collection"
        fill
        priority
        sizes="100vw"
        className="object-cover"
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
