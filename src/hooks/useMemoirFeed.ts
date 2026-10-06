"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api/client";
import { MemoryItem } from "@/features/dashboard/types";
import { normalizeMemory, BackendMemory } from "@/lib/validations/memory";

export function useMemoirFeed(memoirId: string) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Initializes as true, preventing the need to synchronously call it in the effect
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const activeMemoirIdRef = useRef(memoirId);

  const fetchFeed = useCallback(
    async (isRefresh: boolean = false) => {
      if (!memoirId) return;

      // Only trigger a new loading state if this is a manual refresh
      if (isRefresh) {
        setLoading(true);
      }

      try {
        const data: BackendMemory[] = await api.getMemoirFeed(memoirId);

        // Skip if the memoir changed while the request was in flight
        if (activeMemoirIdRef.current !== memoirId) return;

        const normalizedMemories: MemoryItem[] = data.map((item) =>
          normalizeMemory(item),
        );

        if (!isMountedRef.current) return;
        setMemories(normalizedMemories);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load archive");
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    [memoirId],
  );

  // Wrap refreshFeed in useCallback so it doesn't trigger endless useEffects in the dashboard
  const refreshFeed = useCallback(() => {
    fetchFeed(true);
  }, [fetchFeed]);

  // Track the latest memoirId so in-flight requests can detect they are stale
  useEffect(() => {
    activeMemoirIdRef.current = memoirId;
  }, [memoirId]);

  // Stop updating state once the hook has unmounted
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Trigger the initial fetch when the component mounts or memoirId changes
  useEffect(() => {
    const initFetch = async () => {
      await fetchFeed();
    };

    initFetch();
  }, [fetchFeed]);
  // Expose the setMemories function so the dashboard can update state optimistically
  return { memories, setMemories, loading, error, refreshFeed };
}
