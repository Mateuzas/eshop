"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn, formatPrice } from "@/lib/utils";
import { PlaceholderImage } from "./placeholder-image";

type ProductCardProduct = {
  slug: string;
  name: string;
  priceCents: number;
  images: string[];
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const [hovered, setHovered] = useState(false);
  const [primary, secondary] = product.images;
  const showSecondary = hovered && Boolean(secondary);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
        {primary ? (
          <>
            <Image
              src={primary}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={cn(
                "object-cover transition-opacity duration-300",
                showSecondary && "opacity-0"
              )}
            />
            {secondary && (
              <Image
                src={secondary}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={cn(
                  "object-cover opacity-0 transition-opacity duration-300",
                  showSecondary && "opacity-100"
                )}
              />
            )}
          </>
        ) : (
          <PlaceholderImage className="absolute inset-0" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
