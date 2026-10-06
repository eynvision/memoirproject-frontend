import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMemoirFeed } from "./useMemoirFeed";

const getMemoirFeed = vi.fn();

vi.mock("@/lib/api/client", () => ({
  api: {
    getMemoirFeed: (...args: unknown[]) => getMemoirFeed(...args),
  },
}));

describe("useMemoirFeed", () => {
  beforeEach(() => {
    getMemoirFeed.mockReset();
  });

  it("fetches and normalizes the feed through the shared normalizer", async () => {
    getMemoirFeed.mockResolvedValue([
      {
        id: "mem-1",
        title: "A memory",
        body_text: "Some text",
        occurred_start: "2024-01-15",
        media_assets: [
          { kind: "photo", url: "https://example.com/photo.jpg" },
        ],
      },
    ]);

    const { result } = renderHook(() => useMemoirFeed("memoir-1"));

    await act(async () => {});

    expect(getMemoirFeed).toHaveBeenCalledWith("memoir-1");
    expect(result.current.memories).toHaveLength(1);
    expect(result.current.memories[0]).toMatchObject({
      id: "mem-1",
      title: "A memory",
      content: "Some text",
      date: "2024-01-15",
      kind: "combined",
      mediaUrl: "https://example.com/photo.jpg",
    });
    expect(result.current.loading).toBe(false);
  });

  it("does not update state after the hook unmounts", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    getMemoirFeed.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { unmount } = renderHook(() => useMemoirFeed("memoir-1"));

    await act(async () => {});
    expect(getMemoirFeed).toHaveBeenCalledWith("memoir-1");

    unmount();

    await act(async () => {
      resolveFetch([{ id: "mem-1", title: "Arrived too late" }]);
    });
  });

  it("ignores a stale response when the memoir changes mid-flight", async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    getMemoirFeed
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce([{ id: "mem-2", title: "Second memoir" }]);

    const { result, rerender } = renderHook(({ id }) => useMemoirFeed(id), {
      initialProps: { id: "memoir-1" },
    });

    await act(async () => {});
    expect(getMemoirFeed).toHaveBeenCalledWith("memoir-1");

    rerender({ id: "memoir-2" });
    await act(async () => {});

    await act(async () => {
      resolveFirst([{ id: "mem-1", title: "First memoir" }]);
    });

    expect(result.current.memories).toHaveLength(1);
    expect(result.current.memories[0].id).toBe("mem-2");
  });

  it("survives a corrupt feed response without throwing", async () => {
    getMemoirFeed.mockResolvedValue([{ id: "mem-1" }]);

    const { result } = renderHook(() => useMemoirFeed("memoir-1"));

    await act(async () => {});

    expect(result.current.memories[0].title).toBe("Untitled");
    expect(result.current.error).toBeNull();
  });
});
