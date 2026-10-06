import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCaptureMemory } from "./useCaptureMemory";

const getPresignedUrl = vi.fn();
const registerMediaMetadata = vi.fn();
const createMemory = vi.fn();

vi.mock("@/lib/api/client", () => ({
  api: {
    getPresignedUrl: (...args: unknown[]) => getPresignedUrl(...args),
    registerMediaMetadata: (...args: unknown[]) => registerMediaMetadata(...args),
    createMemory: (...args: unknown[]) => createMemory(...args),
  },
}));

describe("useCaptureMemory", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getPresignedUrl.mockReset();
    registerMediaMetadata.mockReset();
    createMemory.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts and stops recording", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.recording).toBe(true);

    await act(async () => {
      result.current.stopRecording();
    });

    expect(result.current.recording).toBe(false);
  });

  it("auto-stops after 10 minutes", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.recording).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    });

    expect(result.current.recording).toBe(false);
    expect(result.current.error).toBe(
      "Maximum recording length (10 minutes) reached.",
    );
  });

  it("clears the max timer when recording stops before 10 minutes", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    await act(async () => {
      result.current.stopRecording();
    });

    expect(result.current.recording).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(11 * 60 * 1000);
    });

    expect(result.current.error).toBeNull();
  });

  it("cleans up timers on unmount", async () => {
    const { result, unmount } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.recording).toBe(true);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(11 * 60 * 1000);
    });

    expect(result.current.error).toBeNull();
  });

  it("rejects an empty title on submit", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      result.current.setDraft((prev) => ({ ...prev, title: "  " }));
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(
      "Please provide a title for this memory.",
    );
    expect(createMemory).not.toHaveBeenCalled();
  });

  it("rejects a submission with no text and no media", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      result.current.setDraft((prev) => ({
        ...prev,
        title: "Title",
        body_text: "  ",
      }));
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(
      "Please write a reflection, record a voice note, or attach a photograph.",
    );
    expect(createMemory).not.toHaveBeenCalled();
  });

  it("submits a valid text memory", async () => {
    createMemory.mockResolvedValue({ id: "mem-1" });

    const { result } = renderHook(() => useCaptureMemory("m1"));

    await act(async () => {
      result.current.setDraft((prev) => ({
        ...prev,
        title: "My memory",
        body_text: "Some text",
      }));
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        memoir_id: "m1",
        title: "My memory",
        body_text: "Some text",
      }),
    );
    expect(result.current.successMsg).toBe("Memory successfully captured!");
  });

  it("rejects an invalid photo type", async () => {
    const { result } = renderHook(() => useCaptureMemory("m1"));

    const textFile = new File(["text"], "file.txt", { type: "text/plain" });

    await act(async () => {
      result.current.setDraft((prev) => ({ ...prev, title: "Title" }));
      result.current.setPhotoFile(textFile);
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(
      "Invalid image format. Please upload a JPEG, PNG, WEBP, or HEIC file.",
    );
    expect(createMemory).not.toHaveBeenCalled();
  });

  it("uploads a photo and submits", async () => {
    getPresignedUrl.mockResolvedValue({
      upload_url: "https://storage.example.com/upload",
      storage_key: "key-123",
    });
    registerMediaMetadata.mockResolvedValue({ id: "asset-1" });
    createMemory.mockResolvedValue({ id: "mem-1" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    const { result } = renderHook(() => useCaptureMemory("m1"));

    const photo = new File(["img"], "photo.jpg", { type: "image/jpeg" });

    await act(async () => {
      result.current.setDraft((prev) => ({ ...prev, title: "Photo" }));
      result.current.setPhotoFile(photo);
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(getPresignedUrl).toHaveBeenCalled();
    expect(registerMediaMetadata).toHaveBeenCalled();
    expect(createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        media_asset_ids: ["asset-1"],
      }),
    );
  });

  it("sets an error when no active memoir is found", async () => {
    const { result } = renderHook(() => useCaptureMemory(""));

    await act(async () => {
      result.current.setDraft((prev) => ({
        ...prev,
        title: "Title",
        body_text: "Text",
      }));
    });

    await act(async () => {
      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe(
      "No active memoir found. Please refresh or restart your session.",
    );
  });
});
