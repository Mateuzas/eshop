import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAdminUser,
  mockUpdateSet,
  mockUpdateWhere,
  mockInsertAuditValues,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockRequireAdminUser: vi.fn(),
  mockUpdateSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
  mockInsertAuditValues: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdminUser: mockRequireAdminUser,
}));

vi.mock("@/lib/db", async () => {
  const schema = await import("@/lib/db/schema");
  return {
    schema,
    getDb: () => ({
      update: () => ({
        set: (vals: unknown) => {
          mockUpdateSet(vals);
          return { where: mockUpdateWhere };
        },
      }),
      insert: () => ({
        values: (vals: unknown) => {
          mockInsertAuditValues(vals);
          return Promise.resolve(undefined);
        },
      }),
    }),
  };
});

const { updateOrderStatus } = await import("./actions");

const admin = { id: "admin-1", email: "admin@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdminUser.mockResolvedValue(admin);
  mockUpdateWhere.mockResolvedValue(undefined);
});

describe("updateOrderStatus", () => {
  it("rejects an invalid status without checking admin", async () => {
    const result = await updateOrderStatus("order-1", "on-the-moon");

    expect(result).toEqual({ error: "Invalid status." });
    expect(mockRequireAdminUser).not.toHaveBeenCalled();
    expect(mockUpdateSet).not.toHaveBeenCalled();
  });

  it("updates the order status and logs an audit entry", async () => {
    const result = await updateOrderStatus("order-1", "shipped");

    expect(result).toEqual({ success: true });
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "shipped" })
    );
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: admin.id,
        action: "order.update_status",
        targetType: "order",
        targetId: "order-1",
        metadata: { status: "shipped" },
      })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
  });

  it.each(["pending", "paid", "shipped", "delivered", "cancelled"])(
    "accepts the %s status",
    async (status) => {
      const result = await updateOrderStatus("order-1", status);
      expect(result).toEqual({ success: true });
    }
  );

  it("propagates rejection when the caller isn't an admin", async () => {
    mockRequireAdminUser.mockRejectedValue(new Error("Forbidden"));

    await expect(updateOrderStatus("order-1", "paid")).rejects.toThrow(
      "Forbidden"
    );
    expect(mockUpdateSet).not.toHaveBeenCalled();
  });
});
