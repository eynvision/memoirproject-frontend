/**
 * @file app/memoir-preview/page.tsx
 * @description Preview screen where the owner reviews the AI-organized
 * chapters, edits chapter text/memory text, reorders/removes memories,
 * and publishes the memoir (a one-way, permanent action).
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useChapterGeneration } from "@/features/memoirPreview/useChapterGeneration";
import { useChapters } from "@/features/memoirPreview/useChapters";
import ChapterEditor from "@/features/memoirPreview/ChapterEditor";
import PublishConfirmModal from "@/features/memoirPreview/PublishConfirmModal";

interface MemoirLocalStorageData {
  data?: { id?: string };
  id?: string;
}

export default function MemoirPreviewPage() {
  const router = useRouter();
  const [memoirId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const savedMemoir = localStorage.getItem("active_memoir");
      if (savedMemoir) {
        const parsed = JSON.parse(savedMemoir) as MemoirLocalStorageData;
        return parsed.data?.id || parsed.id || "";
      }
    } catch (err) {
      console.error("Failed to read active memoir from localStorage", err);
    }
    return "";
  });
  const [checkedForPublished, setCheckedForPublished] = useState(false);
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const { chapters, setChapters, loading: chaptersLoading, refetch: refetchChapters } = useChapters(
    memoirId,
    "draft"
  );

  const {
    status: generationStatus,
    error: generationError,
    isPolling,
    triggerGeneration,
    checkExistingStatus,
  } = useChapterGeneration(memoirId, () => {
    refetchChapters();
  });

  // On mount: check if this memoir was already published, and pick up any in-flight generation.
  useEffect(() => {
    if (!memoirId) return;
    (async () => {
      try {
        const published = await api.getChapters(memoirId, "published");
        if (published.length > 0) {
          setAlreadyPublished(true);
        } else {
          checkExistingStatus();
        }
      } catch (err) {
        console.error("Failed to check published chapters:", err);
      } finally {
        setCheckedForPublished(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoirId]);

  const handleUpdateChapter = (updatedChapter: (typeof chapters)[number]) => {
    setChapters((prev) => prev.map((c) => (c.id === updatedChapter.id ? updatedChapter : c)));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);
    try {
      await api.publishMemoir(memoirId);
      router.push("/final-memoir");
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish memoir.");
      setIsPublishing(false);
    }
  };

  if (!memoirId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-memory-bg px-6 text-center">
        <p className="text-sm text-memory-muted">
          No active memoir found. Please complete onboarding first.
        </p>
      </div>
    );
  }

  if (!checkedForPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-memory-bg">
        <p className="text-sm text-memory-muted">Loading...</p>
      </div>
    );
  }

  if (alreadyPublished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-memory-bg px-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-memory-maroon">
          This memoir has already been published
        </h1>
        <p className="max-w-md text-sm text-memory-muted">
          Published memoirs are read-only. You can view the final memoir below.
        </p>
        <button
          type="button"
          onClick={() => router.push("/final-memoir")}
          className="rounded-lg bg-memory-maroon px-4 py-2 text-sm font-medium text-memory-light hover:bg-memory-primary"
        >
          Open final memoir
        </button>
      </div>
    );
  }

  const hasDraftChapters = chapters.length > 0;

  return (
    <div className="min-h-screen bg-memory-bg px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-memory-accent">
              Preview
            </p>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-memory-maroon sm:text-3xl">
              Review your memoir before publishing
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-memory-muted">
              An AI agent has organized your memories into chapters. Edit
              anything below, then publish when you&apos;re ready — published
              memoirs can&apos;t be edited afterward.
            </p>
          </div>
          {hasDraftChapters && (
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              className="shrink-0 rounded-lg bg-memory-maroon px-4 py-2 text-sm font-medium text-memory-light transition-all hover:bg-memory-primary"
            >
              Publish memoir
            </button>
          )}
        </div>

        {publishError && (
          <p className="mb-4 rounded-lg border border-memory-required/40 bg-memory-required/10 px-4 py-2 text-sm text-memory-required">
            {publishError}
          </p>
        )}

        {!hasDraftChapters && (generationStatus === "idle" || generationStatus === "failed") && !chaptersLoading && (
          <div className="rounded-2xl border border-memory-border bg-memory-card p-10 text-center shadow-sm">
            <h3 className="font-serif text-xl font-bold text-memory-maroon">
              Organize your memories into chapters
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-memory-muted">
              Our AI agent will read through your memories and group them
              into a well-organized memoir with chapters you can review and
              edit.
            </p>
            {generationError && (
              <p className="mt-4 text-sm text-memory-required">{generationError}</p>
            )}
            <button
              type="button"
              onClick={triggerGeneration}
              className="mt-6 rounded-lg bg-memory-maroon px-5 py-2.5 text-sm font-medium text-memory-light transition-all hover:bg-memory-primary"
            >
              {generationStatus === "failed" ? "Retry generation" : "Generate chapters"}
            </button>
          </div>
        )}

        {(generationStatus === "running" || isPolling) && !hasDraftChapters && (
          <div className="rounded-2xl border border-memory-border bg-memory-card p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-memory-maroon border-t-transparent" />
            <p className="text-sm text-memory-muted">
              Organizing your memories into chapters. This may take a
              minute...
            </p>
          </div>
        )}

        {hasDraftChapters && (
          <div className="space-y-6">
            {chapters
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((chapter) => (
                <ChapterEditor
                  key={chapter.id}
                  memoirId={memoirId}
                  chapter={chapter}
                  onChapterUpdated={handleUpdateChapter}
                />
              ))}
          </div>
        )}
      </div>

      <PublishConfirmModal
        open={showPublishModal}
        isPublishing={isPublishing}
        onCancel={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
      />
    </div>
  );
}
