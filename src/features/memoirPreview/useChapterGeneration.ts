/**
 * @file features/memoirPreview/useChapterGeneration.ts
 * @description Hook to trigger AI chapter generation for a memoir and poll
 * its status, mirroring the trigger+poll shape of hooks/useExportMemoir.ts.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { api, GenerationStatusEntity } from "@/lib/api/client";

export function useChapterGeneration(memoirId: string, onCompleted?: () => void) {
  const [status, setStatus] = useState<GenerationStatusEntity["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompletedRef = useRef(onCompleted);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollStatus = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 30;
    setIsPolling(true);

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await api.getGenerationStatus(memoirId);
        setStatus(data.status);

        if (data.status === "completed") {
          stopPolling();
          onCompletedRef.current?.();
        } else if (data.status === "failed") {
          stopPolling();
          setError(data.error_message || "Chapter generation failed.");
        } else if (attempts >= maxAttempts) {
          stopPolling();
          setError("Chapter generation timed out. Please try again.");
        }
      } catch (pollErr) {
        console.error("Generation status polling error:", pollErr);
      }
    }, 2000);
  }, [memoirId, stopPolling]);

  const triggerGeneration = useCallback(async () => {
    if (!memoirId) {
      setError("No active memoir found.");
      return;
    }
    setError(null);
    setStatus("running");
    try {
      await api.generateChapters(memoirId);
      pollStatus();
    } catch (err: unknown) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Failed to start chapter generation.");
    }
  }, [memoirId, pollStatus]);

  const checkExistingStatus = useCallback(async () => {
    if (!memoirId) return;
    try {
      const data = await api.getGenerationStatus(memoirId);
      setStatus(data.status);
      if (data.status === "running") {
        pollStatus();
      }
    } catch (err) {
      console.error("Failed to fetch generation status:", err);
    }
  }, [memoirId, pollStatus]);

  return {
    status,
    error,
    isPolling,
    triggerGeneration,
    checkExistingStatus,
  };
}
