"use client";

import { useState } from "react";
import { Save, Trash2, Volume2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePatchMemory,
  useSubmitMemory,
  useUploadMedia,
  useRemoveMedia,
} from "@/features/memory/hooks";
import {
  VoiceRecorder,
  type RecordedClip,
} from "@/features/memory/components/VoiceRecorder";
import {
  ImagePicker,
  type PickedImage,
} from "@/features/memory/components/ImagePicker";
import { compressImage } from "@/features/memory/compress";
import { isApiError } from "@/lib/api/errors";
import type { MediaAsset, Memory } from "@/features/memory/schemas";

type Props = {
  memoirId: string;
  onClose: () => void;
  memory?: Memory;
  memoryId?: string; // Pre-created draft ID
};

function audioExtension(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg")) return "mp3";
  return "webm";
}

export function MemoryComposer({
  memoirId,
  onClose,
  memory,
  memoryId: propMemoryId,
}: Props) {
  const isEditMode = Boolean(memory);

  // Use the prop memoryId if provided, otherwise fall back to memory?.id
  const [memoryId, setMemoryId] = useState<string | null>(
    memory?.id ?? propMemoryId ?? null,
  );

  const [title, setTitle] = useState(memory?.title ?? "");
  const [bodyText, setBodyText] = useState(memory?.body_text ?? "");

  const [existingMedia, setExistingMedia] = useState<MediaAsset[]>(
    memory?.media ?? [],
  );

  const [audioClips, setAudioClips] = useState<RecordedClip[]>([]);
  const [photos, setPhotos] = useState<PickedImage[]>([]);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);

  const patch = usePatchMemory(memoirId);
  const submit = useSubmitMemory(memoirId);
  const upload = useUploadMedia();
  const removeMedia = useRemoveMedia(memoirId);

  const hasContent =
    Boolean(title.trim() || bodyText.trim()) ||
    audioClips.length > 0 ||
    photos.length > 0 ||
    existingMedia.length > 0;

  async function handleRemoveExistingMedia(assetId: string) {
    if (!memoryId) return;
    if (!window.confirm("Remove this attachment? This cannot be undone."))
      return;
    try {
      await removeMedia.mutateAsync({ memoryId, mediaAssetId: assetId });
      setExistingMedia((prev) => prev.filter((asset) => asset.id !== assetId));
    } catch (error) {
      setUploadError(
        isApiError(error)
          ? error.message
          : "Could not remove attachment. Please try again.",
      );
    }
  }

  async function handleSubmit() {
    if (!memoryId) {
      setUploadError("Memory draft missing. Please refresh and try again.");
      return;
    }
    if (!hasContent) return;

    setUploadError(null);
    setUploading(true);

    try {
      setProgressLabel("Saving text…");
      await patch.mutateAsync({
        memoryId,
        patch: { title, body_text: bodyText },
      });

      setProgressLabel("Preparing photographs…");
      const preparedPhotos = await Promise.all(
        photos.map(async (photo) => ({
          ...photo,
          file: await compressImage(photo.file),
        })),
      );

      const total = audioClips.length + preparedPhotos.length;
      let done = 0;
      const tick = () => {
        done += 1;
        setProgressLabel(`Uploading ${done} of ${total}…`);
      };
      if (total > 0) setProgressLabel(`Uploading 0 of ${total}…`);

      const audioUploads = audioClips.map((clip, i) =>
        upload
          .mutateAsync({
            memoirId,
            memoryId,
            file: clip.blob,
            kind: "audio",
            mimeType: clip.mimeType,
            durationMs: Math.max(1000, Math.round(clip.durationMs)),
            originalFilename: `voice_note_${Date.now()}_${i + 1}.${audioExtension(
              clip.mimeType,
            )}`,
          })
          .then(tick),
      );

      const photoUploads = preparedPhotos.map((photo) =>
        upload
          .mutateAsync({
            memoirId,
            memoryId,
            file: photo.file,
            kind: "photo",
            mimeType: photo.file.type,
            caption: photo.caption || undefined,
            originalFilename: photo.file.name,
          })
          .then(tick),
      );

      await Promise.all([...audioUploads, ...photoUploads]);

      if (!isEditMode) {
        setProgressLabel("Finishing…");
        await submit.mutateAsync(memoryId);
      }

      audioClips.forEach((clip) => URL.revokeObjectURL(clip.url));
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));

      onClose();
    } catch (error) {
      const message = isApiError(error)
        ? error.code === "network"
          ? "Connection lost during upload. Your text is safe. Please try again."
          : error.message
        : "Something went wrong. Your text is safe. Please try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
      setProgressLabel(null);
    }
  }

  const existingPhotos = existingMedia.filter((m) => m.kind === "photo");
  const existingAudios = existingMedia.filter((m) => m.kind === "audio");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(36,26,18,0.35)] p-4 backdrop-blur-[6px]">
      <div className="relative flex max-h-[88vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[20px] border border-paper-400 bg-paper-000 shadow-e3">
        <header className="flex items-center justify-between border-b border-paper-400 px-6 py-4">
          <h2 className="font-heading text-[22px] text-ink-900">
            {isEditMode ? "Edit memory" : "Add memory"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close memory composer"
            className="grid size-10 place-items-center rounded-full text-ink-400 transition-colors hover:bg-paper-200 hover:text-ink-700"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <Label
              htmlFor="memory-title"
              className="text-sm font-medium text-ink-700"
            >
              Title
            </Label>
            <Input
              id="memory-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this memory a title"
              className="bg-paper-000"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="memory-body"
              className="text-sm font-medium text-ink-700"
            >
              Description
            </Label>
            <textarea
              id="memory-body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="What happened, and who was there?"
              className="min-h-[140px] w-full rounded-lg border border-paper-400 bg-paper-000 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-500/20"
            />
          </div>

          {/* Existing audio attachments (edit mode) */}
          {existingAudios.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-ink-700">
                Voice notes already attached
              </Label>
              <ul className="space-y-2">
                {existingAudios.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex flex-col gap-2 rounded-lg border border-paper-400 bg-paper-100 p-3 text-sm text-ink-700 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4 text-ink-400" />
                      <span className="font-medium">
                        {asset.duration_ms
                          ? `${Math.round(asset.duration_ms / 1000)}s recording`
                          : "Voice note"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <audio
                        controls
                        preload="none"
                        src={asset.playback_url}
                        className="h-8 w-48"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingMedia(asset.id)}
                        aria-label="Remove voice note"
                        className="grid size-8 place-items-center rounded-full text-ink-300 transition-colors hover:bg-clay-100 hover:text-clay-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-ink-700">
              Add voice note
            </Label>
            <VoiceRecorder
              onSave={(clip) => setAudioClips((prev) => [...prev, clip])}
            />
            {audioClips.length > 0 && (
              <ul className="space-y-2 pt-2">
                {audioClips.map((clip, index) => (
                  <li
                    key={`${clip.url}-${index}`}
                    className="flex flex-col gap-2 rounded-lg border border-moss-500/20 bg-moss-100 p-3 text-sm text-ink-700 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4 text-moss-500" />
                      <span className="font-medium">
                        New voice note {index + 1} (
                        {Math.round(clip.durationMs / 1000)}s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <audio controls src={clip.url} className="h-8 w-48" />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(clip.url);
                          setAudioClips((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        aria-label={`Remove new voice note ${index + 1}`}
                        className="grid size-8 place-items-center rounded-full text-ink-300 transition-colors hover:bg-clay-100 hover:text-clay-500"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Existing photos (edit mode) */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-ink-700">
                Photographs already attached
              </Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {existingPhotos.map((asset) => (
                  <div key={asset.id} className="space-y-2">
                    <div className="rounded-md bg-white p-1 shadow-e1 ring-1 ring-paper-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.playback_url}
                        alt={asset.caption ?? "Memory photo"}
                        loading="lazy"
                        className="h-20 w-full rounded-sm object-cover"
                      />
                    </div>
                    {asset.caption && (
                      <p className="line-clamp-2 text-xs text-ink-400">
                        {asset.caption}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExistingMedia(asset.id)}
                      className="text-ink-500 hover:bg-clay-100 hover:text-clay-500"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-ink-700">
              Add photograph
            </Label>
            <ImagePicker images={photos} onChange={setPhotos} />
          </div>

          {uploadError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {uploadError}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end border-t border-paper-400 bg-paper-000 px-6 py-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || !hasContent}
            size="lg"
          >
            {uploading ? (
              progressLabel ??
              (isEditMode ? "Saving changes…" : "Saving memory…")
            ) : (
              <>
                <Save className="size-4" />
                {isEditMode ? "Save changes" : "Save memory"}
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}