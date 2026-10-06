import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useComments } from "./useComments";

const getComments = vi.fn();
const createComment = vi.fn();

vi.mock("@/lib/api/client", () => ({
  api: {
    getComments: (...args: unknown[]) => getComments(...args),
    createComment: (...args: unknown[]) => createComment(...args),
  },
}));

describe("useComments", () => {
  beforeEach(() => {
    getComments.mockReset();
    getComments.mockResolvedValue([]);
    createComment.mockReset();
  });

  it("loads comments on mount", async () => {
    getComments.mockResolvedValue([{ id: "c1", body: "Hello" }]);

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([{ id: "c1", body: "Hello" }]);
  });

  it("skips the fetch when memoryId is empty", async () => {
    const { result } = renderHook(() => useComments("", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getComments).not.toHaveBeenCalled();
  });

  it("sets an error when loading fails", async () => {
    getComments.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("appends a new comment on successful submit", async () => {
    getComments.mockResolvedValue([{ id: "c1", body: "First" }]);
    createComment.mockResolvedValue({ id: "c2", body: "Second" });

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addComment("Second");
    });

    expect(result.current.comments).toEqual([
      { id: "c1", body: "First" },
      { id: "c2", body: "Second" },
    ]);
  });

  it("ignores a blank comment", async () => {
    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await act(async () => {
      await result.current.addComment("   ");
    });

    expect(createComment).not.toHaveBeenCalled();
  });

  it("sets an error when memoirId is missing", async () => {
    const { result } = renderHook(() => useComments("mem-1", ""));

    await act(async () => {
      await result.current.addComment("Hello");
    });

    expect(result.current.error).toBe("Memoir ID is missing.");
    expect(createComment).not.toHaveBeenCalled();
  });

  it("rethrows and sets an error when submission fails", async () => {
    createComment.mockRejectedValue(new Error("Submit failed"));

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.addComment("Hello").catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Submit failed");
    });
  });

  it("trims the comment body before sending", async () => {
    createComment.mockResolvedValue({ id: "c1", body: "Trimmed" });

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addComment("  Trimmed  ");
    });

    expect(createComment).toHaveBeenCalledWith(
      expect.objectContaining({ body: "Trimmed" }),
    );
  });

  it("toggles submitting during the request", async () => {
    let resolveSubmit: (value: unknown) => void;
    createComment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    const { result } = renderHook(() => useComments("mem-1", "m1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.addComment("Hello");
    });

    expect(result.current.submitting).toBe(true);

    await act(async () => {
      resolveSubmit({ id: "c1", body: "Hello" });
    });

    expect(result.current.submitting).toBe(false);
  });
});
