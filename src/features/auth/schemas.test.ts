import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("produces the email error message", () => {
    const result = loginSchema.safeParse({
      email: "bad",
      password: "secret123",
    });
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please enter a valid email address.",
      );
    }
  });

  it("produces the password error message", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 6 characters long.",
      );
    }
  });
});

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    const result = signupSchema.safeParse({
      full_name: "Jane Doe",
      email: "jane@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty full name", () => {
    const result = signupSchema.safeParse({
      full_name: "",
      email: "jane@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({
      full_name: "Jane Doe",
      email: "nope",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = signupSchema.safeParse({
      full_name: "Jane Doe",
      email: "jane@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("produces the full name error message", () => {
    const result = signupSchema.safeParse({
      full_name: "",
      email: "jane@example.com",
      password: "secret123",
    });
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Full name is required.");
    }
  });
});
