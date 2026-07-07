import { describe, expect, it } from "vitest";

import { productSchema } from "./product";

describe("productSchema", () => {
  it("accepts a minimal valid product and fills in defaults", () => {
    const result = productSchema.safeParse({
      name: "Cotton Overshirt",
      priceCents: 4900,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
      expect(result.data.stockQty).toBe(1);
      expect(result.data.isPublished).toBe(false);
      expect(result.data.images).toEqual([]);
    }
  });

  it("rejects more than 8 images", () => {
    const result = productSchema.safeParse({
      name: "Cotton Overshirt",
      priceCents: 4900,
      images: Array.from({ length: 9 }, (_, i) => `https://example.com/${i}.jpg`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a price below 1 cent", () => {
    const result = productSchema.safeParse({
      name: "Free Item",
      priceCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative stock quantity", () => {
    const result = productSchema.safeParse({
      name: "Cotton Overshirt",
      priceCents: 4900,
      stockQty: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing product name", () => {
    const result = productSchema.safeParse({ priceCents: 4900 });
    expect(result.success).toBe(false);
  });
});
