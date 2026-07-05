import { desc, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { HeroSection } from "@/components/store/hero-section";
import { ProductRail } from "@/components/store/product-rail";
import { EditorialBanner } from "@/components/store/editorial-banner";

async function getFeaturedProducts() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.isPublished, true))
      .orderBy(desc(schema.products.createdAt))
      .limit(8);
  } catch (error) {
    // The homepage is otherwise static — don't take the whole page down if
    // the database is unreachable, just show it without the product rail.
    console.error("Failed to load featured products:", error);
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HeroSection />

      <EditorialBanner
        kicker="The Collection"
        heading="Considered pieces, built to last."
        body="Every garment is cut, sewn, and finished by hand in small batches."
        cta="Shop the Collection"
        href="/products"
      />

      <ProductRail
        heading="New Arrivals"
        viewAllHref="/products"
        products={featured}
      />

      <EditorialBanner
        kicker="Craft"
        heading="Made with care in Lithuania."
        cta="Our Story"
        href="/about"
        imageSide="right"
      />
    </>
  );
}
