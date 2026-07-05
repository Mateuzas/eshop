"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import { useCartStore } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CartTrigger() {
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());
  const totalItems = useCartStore((s) => s.totalItems());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open bag, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
            className="relative size-11 lg:size-9"
          />
        }
      >
        <ShoppingBag className="size-5" />
        {totalItems > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center bg-brand text-[10px] leading-none text-brand-foreground">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border pt-safe">
          <SheetTitle className="kicker">Bag ({totalItems})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your bag is empty.
            </p>
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/products"
                  className={buttonVariants({ size: "cta" })}
                />
              }
            >
              Continue shopping
            </SheetClose>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4">
              {items.map((item, i) => (
                <li key={item.productId}>
                  {i > 0 && <Separator />}
                  <div className="flex gap-4 py-4">
                    <div className="relative aspect-3/4 w-20 shrink-0 overflow-hidden bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name}`}
                          className="flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.priceCents)}
                      </p>
                      <div className="mt-auto flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="flex size-7 items-center justify-center border border-border"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-4 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="flex size-7 items-center justify-center border border-border"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter className="gap-3 border-t border-border pb-safe">
              <div className="flex items-center justify-between">
                <span className="kicker text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-sm">{formatPrice(totalCents)}</span>
              </div>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/checkout"
                    className={cn(buttonVariants({ size: "cta" }), "w-full")}
                  />
                }
              >
                Checkout
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/cart"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "cta" }),
                      "w-full"
                    )}
                  />
                }
              >
                View bag
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
