import { desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const orders = await getDb()
    .select()
    .from(schema.orders)
    .orderBy(desc(schema.orders.createdAt))
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage customer orders.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
