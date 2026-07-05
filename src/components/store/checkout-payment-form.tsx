"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";

import { useCartStore } from "@/lib/store/cart";
import { getStripePromise } from "@/lib/stripe/client";
import { stripeAppearance, stripeFonts } from "@/lib/stripe/appearance";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PaymentFormInner({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      clearCart();
      router.push(`/checkout/success?order=${orderId}`);
      return;
    }

    // Other statuses (e.g. processing) still count as accepted — the
    // webhook reconciles the final order status.
    clearCart();
    router.push(`/checkout/success?order=${orderId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className={cn(buttonVariants({ size: "cta" }), "w-full")}
      >
        {submitting ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}

export function CheckoutPaymentForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  return (
    <Elements
      stripe={getStripePromise()}
      options={{ clientSecret, appearance: stripeAppearance, fonts: stripeFonts }}
    >
      <PaymentFormInner orderId={orderId} />
    </Elements>
  );
}
