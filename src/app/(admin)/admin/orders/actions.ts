"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { getDb, schema } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/require-admin";

const statusSchema = z.enum([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

type ActionResult = { error: string } | { success: true };

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { error: "Invalid status." };
  }

  const admin = await requireAdminUser();
  const db = getDb();

  await db
    .update(schema.orders)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId));

  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.id,
    action: "order.update_status",
    targetType: "order",
    targetId: orderId,
    metadata: { status: parsed.data },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}
