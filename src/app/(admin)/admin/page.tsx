import Link from "next/link";
import { count, desc, inArray, lte, sum } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LOW_STOCK_THRESHOLD = 5;
const REVENUE_STATUSES = ["paid", "shipped", "delivered"] as const;

async function getDashboardData() {
  const db = getDb();

  const [[revenueRow], [orderCountRow], [productCountRow], recentOrders, lowStockProducts] =
    await Promise.all([
      db
        .select({ total: sum(schema.orders.totalCents) })
        .from(schema.orders)
        .where(inArray(schema.orders.status, REVENUE_STATUSES)),
      db.select({ value: count() }).from(schema.orders),
      db.select({ value: count() }).from(schema.products),
      db
        .select()
        .from(schema.orders)
        .orderBy(desc(schema.orders.createdAt))
        .limit(5),
      db
        .select()
        .from(schema.products)
        .where(lte(schema.products.stockQty, LOW_STOCK_THRESHOLD))
        .orderBy(schema.products.stockQty)
        .limit(5),
    ]);

  return {
    totalRevenueCents: Number(revenueRow?.total ?? 0),
    orderCount: orderCountRow?.value ?? 0,
    productCount: productCountRow?.value ?? 0,
    recentOrders,
    lowStockProducts,
  };
}

export default async function AdminDashboard() {
  const { totalRevenueCents, orderCount, productCount, recentOrders, lowStockProducts } =
    await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl">
              {formatPrice(totalRevenueCents)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-2xl">{orderCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Products</CardDescription>
            <CardTitle className="text-2xl">{productCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The latest 5 orders placed.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href="/admin/orders"
                          className="font-mono text-xs hover:underline"
                        >
                          {order.id.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(order.totalCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>
              Products at or below {LOW_STOCK_THRESHOLD} units.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing low on stock.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link
                          href="/admin/products"
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stockQty === 0 ? "destructive" : "outline"}>
                          {product.stockQty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
