// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore } from "./cart";

const shirt = {
  productId: "product-1",
  name: "Cotton Overshirt",
  priceCents: 4900,
  image: null,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("useCartStore", () => {
  it("adds a new item with quantity 1", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    expect(useCartStore.getState().items).toEqual([
      { ...shirt, size: "M", quantity: 1 },
    ]);
  });

  it("increments quantity when the same product and size is added again", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("treats the same product in a different size as a distinct line item", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "L" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("removes only the line item matching productId + size", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "L" });
    useCartStore.getState().removeItem(shirt.productId, "M");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe("L");
  });

  it("updates the quantity of a matching line item", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().updateQuantity(shirt.productId, 5, "M");
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes the line item when quantity is updated to 0 or below", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().updateQuantity(shirt.productId, 0, "M");
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "L" });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("computes totalCents across all line items", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "L" });
    // 2x M (4900*2) + 1x L (4900) = 14700
    expect(useCartStore.getState().totalCents()).toBe(14700);
  });

  it("computes totalItems as the sum of quantities, not line item count", () => {
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "M" });
    useCartStore.getState().addItem({ ...shirt, size: "L" });
    expect(useCartStore.getState().totalItems()).toBe(3);
  });
});
