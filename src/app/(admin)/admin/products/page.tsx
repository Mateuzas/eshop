import { desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const products = await getDb()
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your product catalog.
        </p>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
