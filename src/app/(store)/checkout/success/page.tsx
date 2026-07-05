import Link from "next/link";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

async function getOrder(orderId: string) {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);
    if (!order) return null;

    const items = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));

    return { order, items };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const result = orderId ? await getOrder(orderId) : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:py-24">
      <span className="kicker text-muted-foreground">Order confirmed</span>
      <h1 className="heading-display mt-4 text-3xl sm:text-4xl">
        Thank you.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {result
          ? `A confirmation has been sent for order #${result.order.id.slice(0, 8).toUpperCase()}.`
          : "Your order has been placed."}
      </p>

      {result && (
        <div className="mt-10 flex flex-col gap-4 border border-border p-6 text-left">
          <span className="kicker text-muted-foreground">Summary</span>
          <Separator />
          <ul className="flex flex-col gap-3">
            {result.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.productSnapshot.name} × {item.quantity}
                </span>
                <span>
                  {formatPrice(item.priceCentsAtPurchase * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span>{formatPrice(result.order.totalCents)}</span>
          </div>
        </div>
      )}

      <Link
        href="/products"
        className={cn(buttonVariants({ size: "cta" }), "mt-10")}
      >
        Continue shopping
      </Link>
    </div>
  );
}
