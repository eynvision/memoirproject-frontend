import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorageDraft } from "./useLocalStorageDraft";

describe("useLocalStorageDraft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() =>
      useLocalStorageDraft("key1", "default"),
    );
    expect(result.current[0]).toBe("default");
  });

  it("reads a stored value on mount", () => {
    localStorage.setItem("key2", JSON.stringify("stored"));
    const { result } = renderHook(() =>
      useLocalStorageDraft("key2", "default"),
    );
    expect(result.current[0]).toBe("stored");
  });

  it("falls back to initial value when stored JSON is corrupt", () => {
    localStorage.setItem("key3", "not valid json{");
    const { result } = renderHook(() =>
      useLocalStorageDraft("key3", "default"),
    );
    expect(result.current[0]).toBe("default");
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorageDraft("key4", "initial"),
    );

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("key4")).toBe(JSON.stringify("updated"));
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() =>
      useLocalStorageDraft("key5", 0),
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("syncs across tabs via the storage event", () => {
    const { result } = renderHook(() =>
      useLocalStorageDraft("key6", "initial"),
    );

    act(() => {
      const event = new StorageEvent("storage", {
        key: "key6",
        newValue: JSON.stringify("from-other-tab"),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe("from-other-tab");
  });

  it("ignores storage events for other keys", () => {
    const { result } = renderHook(() =>
      useLocalStorageDraft("key7", "initial"),
    );

    act(() => {
      const event = new StorageEvent("storage", {
        key: "other-key",
        newValue: JSON.stringify("other"),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe("initial");
  });

  it("removes the storage listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useLocalStorageDraft("key8", "initial"),
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );
  });
});
