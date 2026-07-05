import { describe, expect, it } from "vitest";

import { checkoutSchema, shippingAddressSchema } from "./checkout";

const validAddress = {
  fullName: "Jane Doe",
  street: "Gedimino pr. 1",
  city: "Vilnius",
  postalCode: "LT-01103",
  phone: "+37061234567",
};

describe("shippingAddressSchema", () => {
  it("accepts a valid Lithuanian address", () => {
    expect(shippingAddressSchema.safeParse(validAddress).success).toBe(true);
  });

  it("rejects a postal code that doesn't match the LT-XXXXX format", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      postalCode: "01103",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that doesn't match +370XXXXXXXX", () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      phone: "+1 555 123 4567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const withoutName = { ...validAddress } as Partial<typeof validAddress>;
    delete withoutName.fullName;
    const result = shippingAddressSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const validItem = {
    productId: "550e8400-e29b-41d4-a716-446655440000",
    quantity: 2,
  };

  it("accepts a valid checkout payload", () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: validAddress,
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty items array", () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: validAddress,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid productId", () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: validAddress,
      items: [{ productId: "not-a-uuid", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity below 1", () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: validAddress,
      items: [{ ...validItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: validAddress,
      items: [{ ...validItem, quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });
});
