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
  isPublished,
}: {
  memoirId: string;
  currentUserId: string;
  isPublished: boolean;
}) {
  const { data, isLoading, isError, refetch } = useMemoriesQuery(memoirId);
  const create = useCreateMemory(memoirId);
  const [composing, setComposing] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [draftMemoryId, setDraftMemoryId] = useState<string | null>(null);

  const submitted = (data?.memories ?? []).filter((m) => m.status === "submitted");

  async function handleAddMemory() {
    if (isPublished) return;
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
    return <p className="py-24 text-center text-ink-500">Loading memories…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-4 py-24 text-center">
        <p className="text-destructive">Couldn&apos;t load memories.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (submitted.length === 0) {
    return (
      <>
        <EmptyState onAdd={handleAddMemory} isPublished={isPublished} />
        {composing && draftMemoryId && (
          <MemoryComposer
            memoirId={memoirId}
            memoryId={draftMemoryId}
            onClose={closeComposer}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-8">
      {!isPublished && (
        <div className="flex justify-end">
          <Button onClick={handleAddMemory}>Add a memory</Button>
        </div>
      )}
      <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
        {submitted.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            currentUserId={currentUserId}
            isPublished={isPublished}
            onEdit={!isPublished ? (m) => setEditingMemory(m) : undefined}
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