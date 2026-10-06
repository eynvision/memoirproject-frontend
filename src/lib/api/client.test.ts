import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./client";

function mockFetchOnce(response: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
}) {
  const fn = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    json: response.json ?? (async () => ({})),
    text: response.text ?? (async () => ""),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("api client", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefixes requests with /api/proxy", async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await api.getUserMemoirs();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/api/memoirs/",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends POST body as JSON", async () => {
    const fetchMock = mockFetchOnce({
      ok: true,
      json: async () => ({ id: "1" }),
    });

    await api.login({ email: "a@b.com", password: "secret123" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "secret123" }),
      }),
    );
  });

  it("parses a string detail error", async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Email already registered" }),
    });

    await expect(
      api.signup({
        email: "a@b.com",
        password: "secret123",
        full_name: "Test",
      }),
    ).rejects.toThrow("Email already registered");
  });

  it("parses an array detail error with field names", async () => {
    mockFetchOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [
          { loc: ["body", "email"], msg: "field required" },
          { loc: ["body", "password"], msg: "field required" },
        ],
      }),
    });

    await expect(
      api.login({ email: "a@b.com", password: "secret123" }),
    ).rejects.toThrow("email: field required | password: field required");
  });

  it("falls back to the message field", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal server error" }),
    });

    await expect(api.getUserMemoirs()).rejects.toThrow(
      "Internal server error",
    );
  });

  it("uses the default message when the error body is unparseable", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(api.getUserMemoirs()).rejects.toThrow(
      "Failed to fetch user memoirs",
    );
  });

  it("returns an empty array on 405 for getUserMemoirs", async () => {
    mockFetchOnce({ ok: false, status: 405 });

    const result = await api.getUserMemoirs();

    expect(result).toEqual([]);
  });

  it("unwraps a data envelope", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({ data: [{ id: "1" }, { id: "2" }] }),
    });

    const result = await api.getUserMemoirs();

    expect(result).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("returns the raw array when there is no envelope", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => [{ id: "1" }],
    });

    const result = await api.getUserMemoirs();

    expect(result).toEqual([{ id: "1" }]);
  });

  it("returns an empty array on 404 for getComments", async () => {
    mockFetchOnce({ ok: false, status: 404 });

    const result = await api.getComments("mem-1");

    expect(result).toEqual([]);
  });

  it("unwraps a comments envelope", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({ comments: [{ id: "c1" }] }),
    });

    const result = await api.getComments("mem-1");

    expect(result).toEqual([{ id: "c1" }]);
  });

  it("unwraps a comment envelope on create", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({ comment: { id: "c1", body: "Nice" } }),
    });

    const result = await api.createComment({
      memoir_id: "m1",
      memory_id: "mem1",
      body: "Nice",
    });

    expect(result).toEqual({ id: "c1", body: "Nice" });
  });

  it("throws when memoirId is missing for export", async () => {
    await expect(api.requestMemoirExport("")).rejects.toThrow(
      "No active memoir ID found.",
    );
  });
});
