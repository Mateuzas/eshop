import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" && session.metadata?.orderId) {
        await getDb()
          .update(orders)
          .set({
            status: "paid",
            stripePaymentId: session.payment_intent as string,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, session.metadata.orderId));
      }
      break;
    }

    // Fired by the /checkout PaymentElement flow, which creates a
    // PaymentIntent directly rather than a Checkout Session.
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntent.metadata?.orderId) {
        await getDb()
          .update(orders)
          .set({
            status: "paid",
            stripePaymentId: paymentIntent.id,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, paymentIntent.metadata.orderId));
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntent.metadata?.orderId) {
        await getDb()
          .update(orders)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(orders.id, paymentIntent.metadata.orderId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
