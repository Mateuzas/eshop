"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import {
  deleteProduct,
  toggleProductPublished,
} from "@/app/(admin)/admin/products/actions";
import type { schema } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductDialog } from "@/components/admin/product-dialog";

type Product = typeof schema.products.$inferSelect;

type DialogState = { mode: "create" } | { mode: "edit"; product: Product };

export function ProductsTable({ products }: { products: Product[] }) {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleTogglePublished(product: Product, next: boolean) {
    setPendingId(product.id);
    const result = await toggleProductPublished(product.id, next);
    if ("error" in result) toast.error(result.error);
    setPendingId(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setPendingId(deleting.id);
    const result = await deleteProduct(deleting.id);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setDeleting(null);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setDialogState({ mode: "create" })}>
          Add product
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No products yet.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(product.priceCents)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={product.stockQty === 0 ? "destructive" : "outline"}
                  >
                    {product.stockQty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.isPublished}
                    disabled={pendingId === product.id}
                    onCheckedChange={(checked) =>
                      handleTogglePublished(product, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setDialogState({ mode: "edit", product })
                      }
                    >
                      <Pencil />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleting(product)}
                    >
                      <Trash2 />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductDialog
        key={
          dialogState
            ? dialogState.mode === "edit"
              ? dialogState.product.id
              : "create"
            : "closed"
        }
        open={!!dialogState}
        onOpenChange={(open) => !open && setDialogState(null)}
        mode={dialogState?.mode ?? "create"}
        product={dialogState?.mode === "edit" ? dialogState.product : undefined}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Products with existing orders can&apos;t
              be deleted — unpublish them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendingId === deleting?.id}
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
