import { describe, expect, it } from "vitest";

import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats a date as '5 Dec 2025'", () => {
    // Local time components avoid timezone flakiness in CI.
    expect(formatDate(new Date(2025, 11, 5))).toBe("5 Dec 2025");
  });

  it("accepts ISO strings", () => {
    expect(formatDate("2025-12-05T12:00:00")).toBe("5 Dec 2025");
  });

  it("returns an empty string for nullish or invalid input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});