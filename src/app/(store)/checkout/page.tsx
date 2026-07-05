"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useCartHydrated, useCartStore } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import {
  shippingAddressSchema,
  type ShippingAddressInput,
} from "@/lib/validations/checkout";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckoutPaymentForm } from "@/components/store/checkout-payment-form";

const EMPTY_FORM: ShippingAddressInput = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  phone: "",
};

export default function CheckoutPage() {
  const mounted = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());

  const [form, setForm] = useState<ShippingAddressInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingAddressInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<{
    clientSecret: string;
    orderId: string;
  } | null>(null);

  function updateField(field: keyof ShippingAddressInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = shippingAddressSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ShippingAddressInput, string>> =
        {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ShippingAddressInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: parsed.data,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setPayment({ clientSecret: data.clientSecret, orderId: data.orderId });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0 && !payment) {
    return (
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Your bag is empty.</p>
        <Link href="/products" className={buttonVariants({ size: "cta" })}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
      <h1 className="heading-display text-3xl sm:text-4xl">Checkout</h1>

      <div className="mt-8 flex flex-col gap-4">
        <span className="kicker text-muted-foreground">
          {payment ? "02 Payment" : "01 Shipping"}
        </span>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
      </div>

      <div className="mt-8">
        {payment ? (
          <CheckoutPaymentForm
            clientSecret={payment.clientSecret}
            orderId={payment.orderId}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street">Street address</Label>
              <Input
                id="street"
                autoComplete="street-address"
                value={form.street}
                onChange={(e) => updateField("street", e.target.value)}
                aria-invalid={!!errors.street}
              />
              {errors.street && (
                <p className="text-xs text-destructive">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  placeholder="LT-00000"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  aria-invalid={!!errors.postalCode}
                />
                {errors.postalCode && (
                  <p className="text-xs text-destructive">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+370XXXXXXXX"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(buttonVariants({ size: "cta" }), "mt-2 w-full")}
            >
              {submitting ? "Continuing…" : "Continue to payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
