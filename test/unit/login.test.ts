import { describe, expect, it } from "vitest";
import { LoginSchema } from "../../types/auth";

describe("API /api/login validation", () => {
  it("validates correct login payload", () => {
    const validPayload = {
      username: "admin",
      password: "correct-password",
    };

    const result = LoginSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it("rejects missing username", () => {
    const invalidPayload = {
      password: "password",
    };

    const result = LoginSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("rejects missing password", () => {
    const invalidPayload = {
      username: "admin",
    };

    const result = LoginSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("rejects empty credentials", () => {
    const invalidPayload = {};

    const result = LoginSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
