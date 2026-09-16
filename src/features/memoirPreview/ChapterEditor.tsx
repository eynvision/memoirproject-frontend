/**
 * @file features/memoirPreview/ChapterEditor.tsx
 * @description Editable view of one draft chapter: title/subtitle/summary
 * edit form, plus its ordered list of memories (edit/move/remove).
 */

"use client";

import { useState } from "react";
import { api, ChapterEntity, ChapterMemoryEntity } from "@/lib/api/client";
import MemoryEditRow from "./MemoryEditRow";

interface ChapterEditorProps {
  memoirId: string;
  chapter: ChapterEntity;
  onChapterUpdated: (chapter: ChapterEntity) => void;
}

export default function ChapterEditor({ memoirId, chapter, onChapterUpdated }: ChapterEditorProps) {
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [subtitle, setSubtitle] = useState(chapter.subtitle || "");
  const [summary, setSummary] = useState(chapter.summary || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveChapter = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateChapter(memoirId, chapter.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        summary: summary.trim(),
      });
      onChapterUpdated({ ...chapter, ...updated });
      setIsEditingChapter(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save chapter.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChapterEdit = () => {
    setTitle(chapter.title);
    setSubtitle(chapter.subtitle || "");
    setSummary(chapter.summary || "");
    setError(null);
    setIsEditingChapter(false);
  };

  const persistOrder = async (memories: ChapterMemoryEntity[]) => {
    onChapterUpdated({ ...chapter, memories });
    try {
      await api.reorderChapterMemories(
        memoirId,
        chapter.id,
        memories.map((m) => m.id)
      );
    } catch (err) {
      console.error("Failed to persist memory order:", err);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const memories = [...chapter.memories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= memories.length) return;
    [memories[index], memories[targetIndex]] = [memories[targetIndex], memories[index]];
    persistOrder(memories);
  };

  const handleRemove = (memoryId: string) => {
    const memories = chapter.memories.filter((m) => m.id !== memoryId);
    if (memories.length === 0) {
      setError("A chapter must keep at least one memory. Move this memory to another chapter first, or leave it here.");
      return;
    }
    persistOrder(memories);
  };

  const handleMemoryUpdated = (updated: ChapterMemoryEntity) => {
    onChapterUpdated({
      ...chapter,
      memories: chapter.memories.map((m) => (m.id === updated.id ? updated : m)),
    });
  };

  return (
    <div className="rounded-2xl border border-memory-border bg-memory-card p-6 shadow-sm">
      {!isEditingChapter ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-memory-maroon">{chapter.title}</h3>
            {chapter.subtitle && (
              <p className="mt-1 text-sm italic text-memory-muted">{chapter.subtitle}</p>
            )}
            {chapter.summary && (
              <p className="mt-2 text-sm leading-6 text-memory-muted">{chapter.summary}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingChapter(true)}
            className="shrink-0 rounded-lg border border-memory-border px-3 py-1 text-[11px] font-medium text-memory-primary hover:bg-memory-bg"
          >
            Edit chapter
          </button>
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title"
            className="w-full rounded-lg border border-memory-border bg-memory-bg px-3 py-2 text-sm font-semibold text-memory-primary outline-none focus:border-memory-accent"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle"
            className="w-full rounded-lg border border-memory-border bg-memory-bg px-3 py-2 text-sm text-memory-primary outline-none focus:border-memory-accent"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Chapter summary"
            rows={3}
            className="w-full rounded-lg border border-memory-border bg-memory-bg px-3 py-2 text-sm text-memory-primary outline-none focus:border-memory-accent"
          />
          {error && <p className="text-xs text-memory-required">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveChapter}
              disabled={saving}
              className="rounded-lg bg-memory-maroon px-3 py-1.5 text-[11px] font-medium text-memory-light hover:bg-memory-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelChapterEdit}
              disabled={saving}
              className="rounded-lg border border-memory-border px-3 py-1.5 text-[11px] font-medium text-memory-primary hover:bg-memory-bg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !isEditingChapter && (
        <p className="mb-3 text-xs text-memory-required">{error}</p>
      )}

      <div className="space-y-3">
        {chapter.memories.map((memory, index) => (
          <MemoryEditRow
            key={memory.id}
            memoirId={memoirId}
            memory={memory}
            isFirst={index === 0}
            isLast={index === chapter.memories.length - 1}
            onUpdated={handleMemoryUpdated}
            onMove={(direction) => handleMove(index, direction)}
            onRemove={() => handleRemove(memory.id)}
          />
        ))}
        {chapter.memories.length === 0 && (
          <p className="text-xs italic text-memory-muted">No memories remain in this chapter.</p>
        )}
      </div>
    </div>
  );
}
