import Link from "next/link";

import { ProductCard } from "./product-card";

type RailProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  images: string[];
};

export function ProductRail({
  heading,
  viewAllHref,
  products,
}: {
  heading: string;
  viewAllHref: string;
  products: RailProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="heading-display text-2xl sm:text-3xl">{heading}</h2>
          <Link
            href={viewAllHref}
            className="kicker border-b border-foreground/70 pb-1 text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
          >
            View All
          </Link>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:px-0 lg:pb-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[45vw] shrink-0 snap-start sm:w-[30vw] lg:w-auto"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
