/**
 * @file features/memoirPreview/useChapters.ts
 * @description Fetch/refetch hook for a memoir's chapters (draft or published).
 */

import { useCallback, useEffect, useState } from "react";
import { api, ChapterEntity } from "@/lib/api/client";

export function useChapters(memoirId: string, status?: "draft" | "published") {
  const [chapters, setChapters] = useState<ChapterEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!memoirId) return;

    async function loadChapters() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getChapters(memoirId, status);
        setChapters(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load chapters.");
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, [memoirId, status, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { chapters, setChapters, loading, error, refetch };
}
