import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExportMemoir } from "./useExportMemoir";

const getUserMemoirs = vi.fn();
const requestMemoirExport = vi.fn();
const getLatestExportStatus = vi.fn();

vi.mock("@/lib/api/client", () => ({
  api: {
    getUserMemoirs: (...args: unknown[]) => getUserMemoirs(...args),
    requestMemoirExport: (...args: unknown[]) => requestMemoirExport(...args),
    getLatestExportStatus: (...args: unknown[]) => getLatestExportStatus(...args),
  },
}));

describe("useExportMemoir", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getUserMemoirs.mockReset();
    requestMemoirExport.mockReset();
    getLatestExportStatus.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the provided memoirId directly", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({
      status: "ready",
      download_url: "https://example.com/file.pdf",
    });

    const { result } = renderHook(() => useExportMemoir("memoir-123"));

    await act(async () => {
      await result.current.triggerExport();
    });

    expect(requestMemoirExport).toHaveBeenCalledWith("memoir-123");
    expect(getUserMemoirs).not.toHaveBeenCalled();
  });

  it("falls back to getUserMemoirs when memoirId is empty", async () => {
    getUserMemoirs.mockResolvedValue([{ id: "fallback-id" }]);
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({
      status: "ready",
      download_url: "https://example.com/file.pdf",
    });

    const { result } = renderHook(() => useExportMemoir(""));

    await act(async () => {
      await result.current.triggerExport();
    });

    expect(getUserMemoirs).toHaveBeenCalled();
    expect(requestMemoirExport).toHaveBeenCalledWith("fallback-id");
  });

  it("throws when no memoir is found", async () => {
    getUserMemoirs.mockResolvedValue([]);

    const { result } = renderHook(() => useExportMemoir(""));

    await act(async () => {
      await result.current.triggerExport();
    });

    expect(result.current.error).toBe("No active memoir found.");
    expect(result.current.isExporting).toBe(false);
  });

  it("polls until status is ready", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus
      .mockResolvedValueOnce({ status: "processing" })
      .mockResolvedValueOnce({ status: "ready", download_url: "https://example.com/f.pdf" });

    const { result } = renderHook(() => useExportMemoir("m1"));

    await act(async () => {
      await result.current.triggerExport();
    });

    expect(result.current.exportMessage).toBe(
      "Formatting book layout in the background...",
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(getLatestExportStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(getLatestExportStatus).toHaveBeenCalledTimes(2);
    expect(result.current.isExporting).toBe(false);
  });

  it("sets an error when status is failed", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({
      status: "failed",
      error_message: "Backend exploded",
    });

    const { result } = renderHook(() => useExportMemoir("m1"));

    await act(async () => {
      await result.current.triggerExport();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(result.current.error).toBe("Export failed: Backend exploded");
  });

  it("times out after 15 attempts", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({ status: "processing" });

    const { result } = renderHook(() => useExportMemoir("m1"));

    await act(async () => {
      await result.current.triggerExport();
    });

    for (let i = 0; i < 15; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
    }

    expect(result.current.error).toBe("Export timed out. Please try again.");
    expect(result.current.isExporting).toBe(false);
  });

  it("clears the polling interval on unmount", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({ status: "processing" });

    const { result, unmount } = renderHook(() => useExportMemoir("m1"));

    await act(async () => {
      await result.current.triggerExport();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    const callCount = getLatestExportStatus.mock.calls.length;

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(getLatestExportStatus.mock.calls.length).toBe(callCount);
  });

  it("completes the export and shows success message", async () => {
    requestMemoirExport.mockResolvedValue({});
    getLatestExportStatus.mockResolvedValue({
      status: "ready",
      download_url: "https://example.com/f.pdf",
    });

    const { result } = renderHook(() => useExportMemoir("m1"));

    await act(async () => {
      await result.current.triggerExport("  My Memoir  ");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportMessage).toBe(
      "PDF downloaded successfully! Check your downloads folder.",
    );
  });
});
