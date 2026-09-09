import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { MemoriesPageClient } from "@/features/memory/components/MemoriesPageClient";
import { getMemories, memoryKeys } from "@/features/memory/server";
import { getMemoir } from "@/features/memoir/server";
import { makeQueryClient } from "@/lib/query/client";

export default async function MemoriesPage({
  params,
}: {
  params: Promise<{ memoirId: string }>;
}) {
  const { memoirId } = await params;
  const queryClient = makeQueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: memoryKeys.list(memoirId),
    queryFn: () => getMemories(memoirId),
  });

  const memoir = await getMemoir(memoirId);
  const isPublished = memoir.status === "published";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemoriesPageClient memoirId={memoirId} currentUserId="owner" isPublished={isPublished} />
    </HydrationBoundary>
  );
}