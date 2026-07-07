import Image from "next/image";
import Link from "next/link";

import { siteMedia } from "@/lib/media";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative -mt-11 h-svh min-h-[640px] w-full sm:-mt-12">
      <Image
        src={siteMedia("products/image.png")}
        alt="Fall / Winter Collection"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-[12vh]">
        <Link href="/products" className={buttonVariants({ size: "cta" })}>
          Shop the Collection
        </Link>
      </div>
    </section>
  );
}
