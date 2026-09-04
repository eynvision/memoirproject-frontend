/**
 * React Query cache keys for the memory feature.
 *
 * Kept in a module with no "use client" directive so both the client hooks
 * and server components (for prefetching/hydration) can import them.
 */

export const memoryKeys = {
  all: ["memory"] as const,
  list: (memoirId: string) => [...memoryKeys.all, "list", memoirId] as const,
  detail: (memoirId: string, memoryId: string) =>
    [...memoryKeys.all, "detail", memoirId, memoryId] as const,
};