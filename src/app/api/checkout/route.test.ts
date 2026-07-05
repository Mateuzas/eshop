import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSelectWhere,
  mockUpdateWhere,
  mockPaymentIntentsCreate,
  mockGetUser,
  insertOrderValues,
  insertOrderItemsValues,
} = vi.hoisted(() => ({
  mockSelectWhere: vi.fn(),
  mockUpdateWhere: vi.fn(),
  mockPaymentIntentsCreate: vi.fn(),
  mockGetUser: vi.fn(),
  insertOrderValues: vi.fn(),
  insertOrderItemsValues: vi.fn(),
}));

vi.mock("@/lib/db", async () => {
  const schema = await import("@/lib/db/schema");
  return {
    schema,
    getDb: () => ({
      select: () => ({
        from: () => ({
          where: mockSelectWhere,
        }),
      }),
      update: () => ({
        set: () => ({
          where: mockUpdateWhere,
        }),
      }),
      transaction: async (
        cb: (tx: {
          insert: (table: unknown) => {
            values: (vals: unknown) =>
              | { returning: () => Promise<unknown[]> }
              | Promise<undefined>;
          };
        }) => Promise<unknown>
      ) =>
        cb({
          insert: (table: unknown) => {
            if (table === schema.orders) {
              return {
                values: (vals: unknown) => {
                  insertOrderValues(vals);
                  return {
                    returning: () =>
                      Promise.resolve([
                        { id: "order-1", ...(vals as Record<string, unknown>) },
                      ]),
                  };
                },
              };
            }
            return {
              values: (vals: unknown) => {
                insertOrderItemsValues(vals);
                return Promise.resolve(undefined);
              },
            };
          },
        }),
    }),
  };
});

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    paymentIntents: { create: mockPaymentIntentsCreate },
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

const { POST } = await import("./route");

const validAddress = {
  fullName: "Jane Doe",
  street: "Gedimino pr. 1",
  city: "Vilnius",
  postalCode: "LT-01103",
  phone: "+37061234567",
};

const productA = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Cotton Overshirt",
  priceCents: 1000,
  stockQty: 5,
  isPublished: true,
  images: ["/a.jpg"],
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: null } });
  mockPaymentIntentsCreate.mockResolvedValue({
    id: "pi_123",
    client_secret: "secret_123",
  });
  mockUpdateWhere.mockResolvedValue(undefined);
});

describe("POST /api/checkout", () => {
  it("returns 400 for an invalid payload", async () => {
    const res = await POST(makeRequest({ shippingAddress: {}, items: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a requested product doesn't exist or isn't published", async () => {
    mockSelectWhere.mockResolvedValue([]);

    const res = await POST(
      makeRequest({
        shippingAddress: validAddress,
        items: [{ productId: productA.id, quantity: 1 }],
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no longer available/i);
  });

  it("returns 400 when requested quantity exceeds stock", async () => {
    mockSelectWhere.mockResolvedValue([{ ...productA, stockQty: 1 }]);

    const res = await POST(
      makeRequest({
        shippingAddress: validAddress,
        items: [{ productId: productA.id, quantity: 2 }],
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/enough stock/i);
  });

  it("recomputes the total from DB prices and ignores any client-supplied amount", async () => {
    const productB = {
      id: "660e8400-e29b-41d4-a716-446655440001",
      name: "Wool Trousers",
      priceCents: 500,
      stockQty: 10,
      isPublished: true,
      images: [],
    };
    mockSelectWhere.mockResolvedValue([productA, productB]);

    const res = await POST(
      makeRequest({
        shippingAddress: validAddress,
        items: [
          { productId: productA.id, quantity: 2 }, // 1000 * 2 = 2000
          { productId: productB.id, quantity: 3 }, // 500 * 3 = 1500
        ],
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ orderId: "order-1", clientSecret: "secret_123" });

    // total recomputed server-side: 2000 + 1500 = 3500
    expect(insertOrderValues).toHaveBeenCalledWith(
      expect.objectContaining({ totalCents: 3500 })
    );
    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 3500 })
    );
  });

  it("passes the created order id as Stripe PaymentIntent metadata", async () => {
    mockSelectWhere.mockResolvedValue([productA]);

    await POST(
      makeRequest({
        shippingAddress: validAddress,
        items: [{ productId: productA.id, quantity: 1 }],
      })
    );

    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { orderId: "order-1" } })
    );
  });
});
