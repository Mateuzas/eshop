"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/app/(admin)/admin/orders/actions";
import type { schema } from "@/lib/db";
import { cn, formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Order = typeof schema.orders.$inferSelect;

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "text-muted-foreground",
  paid: "text-foreground",
  shipped: "text-foreground",
  delivered: "text-foreground",
  cancelled: "text-destructive",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  async function handleStatusChange(order: Order, status: string) {
    setPendingId(order.id);
    setLocalStatus((prev) => ({ ...prev, [order.id]: status }));

    const result = await updateOrderStatus(order.id, status);

    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      setLocalStatus((prev) => ({ ...prev, [order.id]: order.status }));
    }
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Placed</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No orders yet.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => {
            const status = localStatus[order.id] ?? order.status;
            return (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {order.shippingAddress?.fullName ?? "Guest"}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(order.totalCents)}
                </TableCell>
                <TableCell>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      handleStatusChange(order, value as string)
                    }
                    disabled={pendingId === order.id}
                  >
                    <SelectTrigger size="sm" className={cn(STATUS_STYLES[status])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
