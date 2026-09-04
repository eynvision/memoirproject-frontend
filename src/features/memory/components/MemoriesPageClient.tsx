// "use client";

// import { useState } from "react";

// import { Button } from "@/components/ui/button";
// import { useMemoriesQuery } from "@/features/memory/hooks";
// import { EmptyState } from "@/features/memory/components/EmptyState";
// import { MemoryCard } from "@/features/memory/components/MemoryCard";
// import { MemoryComposer } from "@/features/memory/components/MemoryComposer";
// import type { Memory } from "@/features/memory/schemas";

// export function MemoriesPageClient({
//   memoirId,
//   currentUserId,
// }: {
//   memoirId: string;
//   currentUserId: string;
// }) {
//   const { data, isLoading, isError, refetch } = useMemoriesQuery(memoirId);
//   const [composing, setComposing] = useState(false);
//   const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

//   const submitted = (data?.memories ?? []).filter((m) => m.status === "submitted");

//   const closeComposer = () => {
//     setComposing(false);
//     setEditingMemory(null);
//     void refetch();
//   };

//   return (
//     <div className="space-y-8">
//       {isLoading ? (
//         <p className="py-24 text-center text-amber-900/70">Loading memories…</p>
//       ) : isError ? (
//         <div className="space-y-4 py-24 text-center">
//           <p className="text-destructive">Couldn&apos;t load memories.</p>
//           <Button onClick={() => void refetch()}>Try again</Button>
//         </div>
//       ) : submitted.length === 0 ? (
//         <EmptyState onAdd={() => setComposing(true)} />
//       ) : (
//         <>
//           <div className="flex justify-end">
//             <Button
//               onClick={() => setComposing(true)}
//               className="rounded-xl bg-[#65402A] hover:bg-amber-950"
//             >
//               + Add Memory
//             </Button>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {submitted.map((memory) => (
//               <MemoryCard
//                 key={memory.id}
//                 memory={memory}
//                 currentUserId={currentUserId}
//                 onEdit={(m) => setEditingMemory(m)}
//               />
//             ))}
//           </div>
//         </>
//       )}

//       {composing && (
//         <MemoryComposer memoirId={memoirId} onClose={closeComposer} />
//       )}

//       {editingMemory && (
//         <MemoryComposer
//           key={editingMemory.id}
//           memoirId={memoirId}
//           memory={editingMemory}
//           onClose={closeComposer}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useMemoriesQuery,
  useCreateMemory,
} from "@/features/memory/hooks";
import { EmptyState } from "@/features/memory/components/EmptyState";
import { MemoryCard } from "@/features/memory/components/MemoryCard";
import { MemoryComposer } from "@/features/memory/components/MemoryComposer";
import type { Memory } from "@/features/memory/schemas";

export function MemoriesPageClient({
  memoirId,
  currentUserId,
}: {
  memoirId: string;
  currentUserId: string;
}) {
  const { data, isLoading, isError, refetch } = useMemoriesQuery(memoirId);
  const create = useCreateMemory(memoirId);

  const [composing, setComposing] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [draftMemoryId, setDraftMemoryId] = useState<string | null>(null);

  const submitted = (data?.memories ?? []).filter((m) => m.status === "submitted");

  async function handleAddMemory() {
    if (draftMemoryId) {
      setComposing(true);
      return;
    }
    try {
      const draft = await create.mutateAsync({});
      setDraftMemoryId(draft.id);
      setComposing(true);
    } catch {
      alert("Could not start a new memory. Please try again.");
    }
  }

  function closeComposer() {
    setComposing(false);
    setEditingMemory(null);
    setDraftMemoryId(null);
    void refetch();
  }

  if (isLoading) {
    return <p className="py-24 text-center text-amber-900/70">Loading memories…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-4 py-24 text-center">
        <p className="text-destructive">Couldn&apos;t load memories.</p>
        <Button onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }

  if (submitted.length === 0) {
    return (
      <>
        <EmptyState onAdd={handleAddMemory} />
        {composing && draftMemoryId && (
          <MemoryComposer
            memoirId={memoirId}
            memoryId={draftMemoryId}
            onClose={closeComposer}
          />
        )}
        {editingMemory && (
          <MemoryComposer
            key={editingMemory.id}
            memoirId={memoirId}
            memory={editingMemory}
            onClose={closeComposer}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          onClick={handleAddMemory}
          className="rounded-xl bg-[#65402A] hover:bg-amber-950"
        >
          + Add Memory
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {submitted.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            currentUserId={currentUserId}
            onEdit={(m) => setEditingMemory(m)}
          />
        ))}
      </div>

      {composing && draftMemoryId && (
        <MemoryComposer
          memoirId={memoirId}
          memoryId={draftMemoryId}
          onClose={closeComposer}
        />
      )}

      {editingMemory && (
        <MemoryComposer
          key={editingMemory.id}
          memoirId={memoirId}
          memory={editingMemory}
          onClose={closeComposer}
        />
      )}
    </div>
  );
}