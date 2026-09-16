/**
 * @file features/memoirPreview/MemoryEditRow.tsx
 * @description One memory inside a draft chapter, with an edit form for
 * title/body_text, move up/down controls, and a remove-from-chapter action.
 */

"use client";

import { useState } from "react";
import { api, ChapterMemoryEntity } from "@/lib/api/client";

interface MemoryEditRowProps {
  memoirId: string;
  memory: ChapterMemoryEntity;
  isFirst: boolean;
  isLast: boolean;
  onUpdated: (memory: ChapterMemoryEntity) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}

export default function MemoryEditRow({
  memoirId,
  memory,
  isFirst,
  isLast,
  onUpdated,
  onMove,
  onRemove,
}: MemoryEditRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(memory.title || "");
  const [bodyText, setBodyText] = useState(memory.body_text || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateMemory(memoirId, memory.id, {
        title: title.trim(),
        body_text: bodyText.trim(),
      });
      onUpdated({ ...memory, ...updated });
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save memory.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(memory.title || "");
    setBodyText(memory.body_text || "");
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-memory-border bg-memory-bg p-4">
      {!isEditing ? (
        <>
          {memory.title && (
            <p className="mb-1 text-sm font-semibold text-memory-primary">{memory.title}</p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-6 text-memory-muted">
            {memory.body_text || "No text content."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-memory-border px-3 py-1 text-[11px] font-medium text-memory-primary hover:bg-memory-card"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onMove("up")}
              disabled={isFirst}
              className="rounded-lg border border-memory-border px-3 py-1 text-[11px] font-medium text-memory-primary hover:bg-memory-card disabled:cursor-not-allowed disabled:opacity-40"
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() => onMove("down")}
              disabled={isLast}
              className="rounded-lg border border-memory-border px-3 py-1 text-[11px] font-medium text-memory-primary hover:bg-memory-card disabled:cursor-not-allowed disabled:opacity-40"
            >
              Move down
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-memory-required/40 px-3 py-1 text-[11px] font-medium text-memory-required hover:bg-memory-required/10"
            >
              Remove from chapter
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Memory title"
            className="w-full rounded-lg border border-memory-border bg-memory-card px-3 py-2 text-sm text-memory-primary outline-none focus:border-memory-accent"
          />
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Memory text"
            rows={4}
            className="w-full rounded-lg border border-memory-border bg-memory-card px-3 py-2 text-sm text-memory-primary outline-none focus:border-memory-accent"
          />
          {error && <p className="text-xs text-memory-required">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-memory-maroon px-3 py-1.5 text-[11px] font-medium text-memory-light hover:bg-memory-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-memory-border px-3 py-1.5 text-[11px] font-medium text-memory-primary hover:bg-memory-card"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
