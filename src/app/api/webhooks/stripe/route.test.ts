import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockConstructEvent, mockUpdateWhere, mockUpdateSet, headerState } =
  vi.hoisted(() => ({
    mockConstructEvent: vi.fn(),
    mockUpdateWhere: vi.fn(),
    mockUpdateSet: vi.fn(),
    headerState: { signature: null as string | null },
  }));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) =>
      name === "stripe-signature" ? headerState.signature : null,
  }),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
  }),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    update: () => ({
      set: (vals: unknown) => {
        mockUpdateSet(vals);
        return { where: mockUpdateWhere };
      },
    }),
  }),
}));

const { POST } = await import("./route");

function makeRequest() {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: "raw-stripe-payload",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  headerState.signature = "valid-signature";
  mockUpdateWhere.mockResolvedValue(undefined);
});

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    headerState.signature = null;
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid signature/i);
  });

  it("marks the order paid on checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          payment_status: "paid",
          payment_intent: "pi_123",
          metadata: { orderId: "order-1" },
        },
      },
    });

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid", stripePaymentId: "pi_123" })
    );
  });

  it("does not update the order if the checkout session isn't paid", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          payment_status: "unpaid",
          metadata: { orderId: "order-1" },
        },
      },
    });

    await POST(makeRequest());

    expect(mockUpdateSet).not.toHaveBeenCalled();
  });

  it("marks the order paid on payment_intent.succeeded", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.succeeded",
      data: {
        object: { id: "pi_456", metadata: { orderId: "order-2" } },
      },
    });

    await POST(makeRequest());

    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid", stripePaymentId: "pi_456" })
    );
  });

  it("marks the order cancelled on payment_intent.payment_failed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.payment_failed",
      data: {
        object: { id: "pi_789", metadata: { orderId: "order-3" } },
      },
    });

    await POST(makeRequest());

    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
  });

  it("acknowledges unhandled event types without touching the DB", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(mockUpdateSet).not.toHaveBeenCalled();
  });
});
