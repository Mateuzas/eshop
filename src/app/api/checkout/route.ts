import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid checkout payload." },
      { status: 400 }
    );
  }

  const { shippingAddress, items } = parsed.data;
  const db = getDb();

  const productIds = items.map((item) => item.productId);
  const products = await db
    .select()
    .from(schema.products)
    .where(inArray(schema.products.id, productIds));

  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || !product.isPublished) {
      return NextResponse.json(
        { error: "One or more items in your bag are no longer available." },
        { status: 400 }
      );
    }
    if (product.stockQty < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} doesn't have enough stock left.` },
        { status: 400 }
      );
    }
  }

  // Prices are always recomputed from the DB — never trust client-supplied
  // amounts for the charge total.
  const totalCents = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.priceCents * item.quantity;
  }, 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [order] = await db.transaction(async (tx) => {
    const [newOrder] = await tx
      .insert(schema.orders)
      .values({
        userId: user?.id ?? null,
        status: "pending",
        totalCents,
        shippingAddress,
      })
      .returning();

    await tx.insert(schema.orderItems).values(
      items.map((item) => {
        const product = productById.get(item.productId)!;
        return {
          orderId: newOrder.id,
          productId: product.id,
          productSnapshot: {
            name: product.name,
            priceCents: product.priceCents,
            image: product.images[0] ?? null,
          },
          quantity: item.quantity,
          priceCentsAtPurchase: product.priceCents,
        };
      })
    );

    return [newOrder];
  });

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order.id },
  });

  await db
    .update(schema.orders)
    .set({ stripePaymentId: paymentIntent.id })
    .where(eq(schema.orders.id, order.id));

  return NextResponse.json({
    orderId: order.id,
    clientSecret: paymentIntent.client_secret,
  });
}
