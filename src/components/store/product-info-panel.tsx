"use client";

import { useState } from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { toast } from "sonner";

import { useCartStore } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// The schema has no per-size inventory, so sizing is a UI-only selector —
// every in-stock product is assumed available in each of these sizes.
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type InfoPanelProduct = {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  images: string[];
  stockQty: number;
};

export function ProductInfoPanel({ product }: { product: InfoPanelProduct }) {
  // "" (rather than null/undefined) so RadioGroup stays controlled across
  // its whole lifetime — Base UI warns if a group starts uncontrolled
  // (value=undefined) and later switches to controlled.
  const [size, setSize] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stockQty > 0;

  function handleAddToBag() {
    if (!size) {
      toast.error("Select a size before adding to bag.");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0] ?? null,
      size,
    });
    toast.success(`Added to bag — ${product.name}, size ${size}`);
  }

  return (
    <div className="flex flex-col gap-6 py-6 lg:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="heading-display text-2xl sm:text-3xl">
          {product.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {formatPrice(product.priceCents)}
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <span className="kicker text-muted-foreground">Size</span>
        <RadioGroupPrimitive
          value={size}
          onValueChange={(value) => setSize(value)}
          className="grid grid-cols-4 gap-2 sm:grid-cols-6"
        >
          {SIZES.map((s) => (
            <RadioPrimitive.Root
              key={s}
              value={s}
              disabled={!inStock}
              className={cn(
                "flex h-11 items-center justify-center border border-border text-sm transition-colors outline-none",
                "hover:border-foreground/60",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "data-checked:border-foreground data-checked:bg-foreground data-checked:text-background",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              {s}
            </RadioPrimitive.Root>
          ))}
        </RadioGroupPrimitive>
      </div>

      <Button
        size="cta"
        className="w-full"
        disabled={!inStock}
        onClick={handleAddToBag}
      >
        {inStock ? "Add to Bag" : "Sold Out"}
      </Button>

      <Accordion multiple>
        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent>
            <p>{product.description || "No description available."}</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
          <AccordionContent>
            <p>
              Free standard shipping on all orders. Delivery in 3–7 business
              days.
            </p>
            <p>Returns accepted within 30 days of delivery, unworn and with tags attached.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
