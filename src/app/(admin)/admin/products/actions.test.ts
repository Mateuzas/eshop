import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAdminUser,
  mockInsertProductsValues,
  mockProductsReturning,
  mockInsertAuditValues,
  mockUpdateSet,
  mockUpdateWhere,
  mockDeleteWhere,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockRequireAdminUser: vi.fn(),
  mockInsertProductsValues: vi.fn(),
  mockProductsReturning: vi.fn(),
  mockInsertAuditValues: vi.fn(),
  mockUpdateSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
  mockDeleteWhere: vi.fn(),
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
      insert: (table: unknown) => ({
        values: (vals: unknown) => {
          if (table === schema.products) {
            mockInsertProductsValues(vals);
            return { returning: mockProductsReturning };
          }
          mockInsertAuditValues(vals);
          return Promise.resolve(undefined);
        },
      }),
      update: () => ({
        set: (vals: unknown) => {
          mockUpdateSet(vals);
          return { where: mockUpdateWhere };
        },
      }),
      delete: () => ({
        where: mockDeleteWhere,
      }),
    }),
  };
});

const { createProduct, updateProduct, deleteProduct, toggleProductPublished } =
  await import("./actions");

const admin = { id: "admin-1", email: "admin@example.com" };

const validInput = {
  name: "Cotton Overshirt",
  description: "A shirt",
  priceCents: 4900,
  stockQty: 5,
  category: "men",
  images: [] as string[],
  isPublished: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdminUser.mockResolvedValue(admin);
  mockProductsReturning.mockResolvedValue([
    { id: "product-1", ...validInput, slug: "cotton-overshirt" },
  ]);
  mockUpdateWhere.mockResolvedValue(undefined);
  mockDeleteWhere.mockResolvedValue(undefined);
});

describe("createProduct", () => {
  it("returns a validation error for invalid input without checking admin", async () => {
    const result = await createProduct({ ...validInput, priceCents: 0 });

    expect(result).toEqual({ error: expect.any(String) });
    expect(mockRequireAdminUser).not.toHaveBeenCalled();
    expect(mockInsertProductsValues).not.toHaveBeenCalled();
  });

  it("creates the product, slugifies the name, and logs an audit entry", async () => {
    const result = await createProduct(validInput);

    expect(result).toEqual({ success: true });
    expect(mockInsertProductsValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cotton Overshirt", slug: "cotton-overshirt" })
    );
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: admin.id,
        action: "product.create",
        targetId: "product-1",
      })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/products");
  });

  it("returns a friendly error when the insert fails (e.g. duplicate slug)", async () => {
    mockProductsReturning.mockRejectedValueOnce(new Error("duplicate key value"));

    const result = await createProduct(validInput);

    expect(result).toEqual({
      error: "A product with a similar name already exists.",
    });
    expect(mockInsertAuditValues).not.toHaveBeenCalled();
  });

  it("propagates rejection when the caller isn't an admin", async () => {
    mockRequireAdminUser.mockRejectedValue(new Error("Forbidden"));

    await expect(createProduct(validInput)).rejects.toThrow("Forbidden");
    expect(mockInsertProductsValues).not.toHaveBeenCalled();
  });
});

describe("updateProduct", () => {
  it("returns a validation error for invalid input without checking admin", async () => {
    const result = await updateProduct("product-1", {
      ...validInput,
      name: "",
    });

    expect(result).toEqual({ error: expect.any(String) });
    expect(mockRequireAdminUser).not.toHaveBeenCalled();
  });

  it("updates the product without touching its slug and logs an audit entry", async () => {
    const result = await updateProduct("product-1", validInput);

    expect(result).toEqual({ success: true });
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cotton Overshirt" })
    );
    expect(mockUpdateSet.mock.calls[0][0]).not.toHaveProperty("slug");
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: admin.id,
        action: "product.update",
        targetId: "product-1",
      })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
  });
});

describe("deleteProduct", () => {
  it("deletes the product and logs an audit entry", async () => {
    const result = await deleteProduct("product-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteWhere).toHaveBeenCalled();
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: admin.id,
        action: "product.delete",
        targetId: "product-1",
      })
    );
  });

  it("returns a friendly error when the product has existing orders (FK violation)", async () => {
    mockDeleteWhere.mockRejectedValueOnce(
      new Error("violates foreign key constraint")
    );

    const result = await deleteProduct("product-1");

    expect(result).toEqual({
      error:
        "This product can't be deleted because it has existing orders. Unpublish it instead.",
    });
    expect(mockInsertAuditValues).not.toHaveBeenCalled();
  });

  it("propagates rejection when the caller isn't an admin", async () => {
    mockRequireAdminUser.mockRejectedValue(new Error("Forbidden"));

    await expect(deleteProduct("product-1")).rejects.toThrow("Forbidden");
    expect(mockDeleteWhere).not.toHaveBeenCalled();
  });
});

describe("toggleProductPublished", () => {
  it("publishes the product and logs a product.publish action", async () => {
    const result = await toggleProductPublished("product-1", true);

    expect(result).toEqual({ success: true });
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ isPublished: true })
    );
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({ action: "product.publish", targetId: "product-1" })
    );
  });

  it("unpublishes the product and logs a product.unpublish action", async () => {
    const result = await toggleProductPublished("product-1", false);

    expect(result).toEqual({ success: true });
    expect(mockInsertAuditValues).toHaveBeenCalledWith(
      expect.objectContaining({ action: "product.unpublish", targetId: "product-1" })
    );
  });
});
