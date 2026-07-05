"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";

import { useCartHydrated, useCartStore } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const mounted = useCartHydrated();

  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());
  const totalItems = useCartStore((s) => s.totalItems());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const displayItems = mounted ? items : [];
  const displayTotalCents = mounted ? totalCents : 0;
  const displayTotalItems = mounted ? totalItems : 0;
  const isEmpty = mounted && displayItems.length === 0;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="heading-display text-3xl sm:text-4xl">
        Bag{mounted && displayTotalItems > 0 ? ` (${displayTotalItems})` : ""}
      </h1>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link href="/products" className={buttonVariants({ size: "cta" })}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-16">
          <ul className="lg:col-span-2">
            {displayItems.map((item, i) => (
              <li key={`${item.productId}-${item.size ?? ""}`}>
                {i > 0 && <Separator />}
                <div className="flex gap-6 py-6">
                  <div className="relative aspect-3/4 w-28 shrink-0 overflow-hidden bg-muted sm:w-36">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 640px) 144px, 112px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm sm:text-base">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label={`Remove ${item.name}`}
                        className="flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    {item.size && (
                      <p className="kicker text-muted-foreground">
                        Size {item.size}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.priceCents)}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.size
                          )
                        }
                        aria-label="Decrease quantity"
                        className="flex size-8 items-center justify-center border border-border"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-4 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.size
                          )
                        }
                        aria-label="Increase quantity"
                        className="flex size-8 items-center justify-center border border-border"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
            <div className="flex flex-col gap-4 border border-border p-6">
              <span className="kicker text-muted-foreground">Summary</span>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(displayTotalCents)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className={cn(buttonVariants({ size: "cta" }), "w-full")}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
