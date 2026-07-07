import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetUser, mockSelectWhere } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSelectWhere: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
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
    }),
  };
});

const { requireAdminUser } = await import("./require-admin");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdminUser", () => {
  it("throws when there is no session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(requireAdminUser()).rejects.toThrow("Not authenticated");
    expect(mockSelectWhere).not.toHaveBeenCalled();
  });

  it("throws when the signed-in user has no profile row", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockSelectWhere.mockResolvedValue([]);

    await expect(requireAdminUser()).rejects.toThrow("Forbidden");
  });

  it("throws when the signed-in user isn't an admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockSelectWhere.mockResolvedValue([{ role: "customer" }]);

    await expect(requireAdminUser()).rejects.toThrow("Forbidden");
  });

  it("returns the user when their profile role is admin", async () => {
    const user = { id: "admin-1", email: "admin@example.com" };
    mockGetUser.mockResolvedValue({ data: { user } });
    mockSelectWhere.mockResolvedValue([{ role: "admin" }]);

    await expect(requireAdminUser()).resolves.toEqual(user);
  });
});
