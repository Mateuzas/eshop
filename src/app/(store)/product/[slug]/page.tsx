import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDb, schema } from "@/lib/db";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductInfoPanel } from "@/components/store/product-info-panel";

async function getProduct(slug: string) {
  try {
    const db = getDb();
    const [product] = await db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.slug, slug),
          eq(schema.products.isPublished, true)
        )
      )
      .limit(1);
    return product ?? null;
  } catch (error) {
    console.error("Failed to load product:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductInfoPanel product={product} />
        </div>
      </div>
    </div>
  );
}
