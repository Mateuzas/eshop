// Placeholder top-level categories. `category` is a freeform text column on
// `products` (see src/lib/db/schema.ts), so these slugs just need to line up
// with whatever category values get seeded later — swap freely.
export const NAV_LINKS = [
  { label: "New Arrivals", href: "/products?category=new-arrivals" },
  { label: "Men", href: "/products?category=men" },
  { label: "Women", href: "/products?category=women" },
  { label: "Accessories", href: "/products?category=accessories" },
] as const;
