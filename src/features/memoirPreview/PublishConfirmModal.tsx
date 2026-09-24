/**
 * @file features/memoirPreview/PublishConfirmModal.tsx
 * @description Confirmation modal shown before permanently publishing a
 * memoir. Once published, chapters and memories can no longer be edited.
 */

"use client";

import { motion } from "framer-motion";

interface PublishConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing?: boolean;
}

export default function PublishConfirmModal({
  open,
  onConfirm,
  onCancel,
  isPublishing = false,
}: PublishConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-memory-border bg-memory-card px-8 py-8 shadow-lg"
      >
        <h2 className="font-serif text-xl font-bold text-memory-maroon">
          Publish this memoir?
        </h2>
        <p className="mt-3 text-sm leading-6 text-memory-muted">
          Once published, the chapters and memories in this memoir can no
          longer be edited, reordered, or removed. This action cannot be
          undone.
        </p>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPublishing}
            className="rounded-lg border border-memory-border px-4 py-2 text-xs font-medium text-memory-primary transition-all hover:bg-memory-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="rounded-lg bg-memory-maroon px-4 py-2 text-xs font-medium text-memory-light transition-all hover:bg-memory-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPublishing ? "Publishing..." : "Publish memoir"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
