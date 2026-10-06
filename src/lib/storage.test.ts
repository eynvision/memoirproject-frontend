import { describe, it, expect, beforeEach } from "vitest";
import { readStorage } from "./storage";

describe("readStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when the key does not exist", () => {
    expect(readStorage("missing_key")).toBeNull();
  });

  it("returns the parsed value for valid JSON", () => {
    localStorage.setItem("user", JSON.stringify({ name: "Ada" }));
    expect(readStorage<{ name: string }>("user")).toEqual({ name: "Ada" });
  });

  it("returns null for corrupt JSON instead of throwing", () => {
    localStorage.setItem("broken", "not valid json{");
    expect(readStorage("broken")).toBeNull();
  });

  it("returns null for an empty string", () => {
    localStorage.setItem("empty", "");
    expect(readStorage("empty")).toBeNull();
  });

  it("parses arrays and primitives", () => {
    localStorage.setItem("list", JSON.stringify([1, 2, 3]));
    expect(readStorage<number[]>("list")).toEqual([1, 2, 3]);

    localStorage.setItem("num", JSON.stringify(42));
    expect(readStorage<number>("num")).toBe(42);
  });
});
