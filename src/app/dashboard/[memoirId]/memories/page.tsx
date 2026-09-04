// import { MemoriesPageClient } from "@/features/memory/components/MemoriesPageClient";

// export default async function MemoriesPage({
//   params,
// }: {
//   params: Promise<{ memoirId: string }>;
// }) {
//   const { memoirId } = await params;

//   // Owner path this cycle: treat the signed-in owner as "You"
//   return <MemoriesPageClient memoirId={memoirId} currentUserId="owner" />;
// }

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { MemoriesPageClient } from "@/features/memory/components/MemoriesPageClient";
import { getMemories, memoryKeys } from "@/features/memory/server";
import { makeQueryClient } from "@/lib/query/client";

export default async function MemoriesPage({
  params,
}: {
  params: Promise<{ memoirId: string }>;
}) {
  const { memoirId } = await params;

  // Fetch on the server and seed the client cache, so the grid renders with
  // data on first paint instead of showing "Loading memories…".
  // A per-request client is required: a shared one would leak data across users.
  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: memoryKeys.list(memoirId),
    queryFn: () => getMemories(memoirId),
  });

  // Owner path this cycle: treat the signed-in owner as "You"
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemoriesPageClient memoirId={memoirId} currentUserId="owner" />
    </HydrationBoundary>
  );
}