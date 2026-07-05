import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validInput = {
    email: "jane@example.com",
    password: "password123",
    fullName: "Jane Doe",
  };

  it("accepts a valid registration payload", () => {
    expect(registerSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a password longer than 72 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "a".repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty full name", () => {
    const result = registerSchema.safeParse({ ...validInput, fullName: "" });
    expect(result.success).toBe(false);
  });
});
