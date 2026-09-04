// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Save, Trash2, Volume2, X } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   useCreateMemory,
//   usePatchMemory,
//   useSubmitMemory,
//   useUploadMedia,
//   useRemoveMedia,
// } from "@/features/memory/hooks";
// import {
//   VoiceRecorder,
//   type RecordedClip,
// } from "@/features/memory/components/VoiceRecorder";
// import {
//   ImagePicker,
//   type PickedImage,
// } from "@/features/memory/components/ImagePicker";
// import { clearDraft } from "@/features/memory/draft-store";
// import { isApiError } from "@/lib/api/errors";
// import type { MediaAsset, Memory } from "@/features/memory/schemas";

// type Props = {
//   memoirId: string;
//   onClose: () => void;
//   /** Pass an existing memory to enter edit mode. Omit for create mode. */
//   memory?: Memory;
// };

// export function MemoryComposer({ memoirId, onClose, memory }: Props) {
//   const isEditMode = Boolean(memory);

//   const [memoryId, setMemoryId] = useState<string | null>(
//     memory?.id ?? null,
//   );
//   const [title, setTitle] = useState(memory?.title ?? "");
//   const [bodyText, setBodyText] = useState(memory?.body_text ?? "");

//   // Existing media already on the server (edit mode only)
//   const [existingMedia, setExistingMedia] = useState<MediaAsset[]>(
//     memory?.media ?? [],
//   );

//   // Newly-added, not-yet-uploaded content
//   const [audioClips, setAudioClips] = useState<RecordedClip[]>([]);
//   const [photos, setPhotos] = useState<PickedImage[]>([]);

//   const [uploadError, setUploadError] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const create = useCreateMemory(memoirId);
//   const patch = usePatchMemory(memoirId);
//   const submit = useSubmitMemory(memoirId);
//   const upload = useUploadMedia();
//   const removeMedia = useRemoveMedia(memoirId);

//   // In CREATE mode: spin up a draft memory row on mount.
//   // In EDIT mode: skip — we already have the memory id.
//   const draftInitRef = useRef(false);
//   useEffect(() => {
//     if (isEditMode || draftInitRef.current) return;
//     draftInitRef.current = true;

//     let active = true;
//     (async () => {
//       try {
//         const draft = await create.mutateAsync({});
//         if (active) setMemoryId(draft.id);
//       } catch (error) {
//         if (active) {
//           setUploadError(
//             isApiError(error)
//               ? error.message
//               : "Could not start a memory draft. Please try again.",
//           );
//         }
//       }
//     })();

//     return () => {
//       active = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const hasContent =
//     Boolean(title.trim() || bodyText.trim()) ||
//     audioClips.length > 0 ||
//     photos.length > 0 ||
//     existingMedia.length > 0;

//   async function handleRemoveExistingMedia(assetId: string) {
//     if (!memoryId) return;
//     if (!window.confirm("Remove this attachment? This cannot be undone.")) return;

//     try {
//       await removeMedia.mutateAsync({ memoryId, mediaAssetId: assetId });
//       setExistingMedia((previous) =>
//         previous.filter((asset) => asset.id !== assetId),
//       );
//     } catch (error) {
//       setUploadError(
//         isApiError(error)
//           ? error.message
//           : "Could not remove attachment. Please try again.",
//       );
//     }
//   }

//   async function handleSubmit() {
//     if (!memoryId || !hasContent) return;

//     setUploadError(null);
//     setUploading(true);

//     try {
//       // 1. Save title/body
//       await patch.mutateAsync({
//         memoryId,
//         patch: { title, body_text: bodyText },
//       });

//       // 2. Upload new audio clips
//       for (let i = 0; i < audioClips.length; i += 1) {
//         const clip = audioClips[i];
//         let extension = "webm";
//         if (clip.mimeType.includes("mp4") || clip.mimeType.includes("aac")) {
//           extension = "m4a";
//         } else if (clip.mimeType.includes("wav")) {
//           extension = "wav";
//         } else if (clip.mimeType.includes("mpeg")) {
//           extension = "mp3";
//         }

//         await upload.mutateAsync({
//           memoirId,
//           memoryId,
//           file: clip.blob,
//           kind: "audio",
//           mimeType: clip.mimeType,
//           durationMs: Math.max(1000, Math.round(clip.durationMs)),
//           originalFilename: `voice_note_${Date.now()}_${i + 1}.${extension}`,
//         });
//       }

//       // 3. Upload new photos
//       for (const photo of photos) {
//         await upload.mutateAsync({
//           memoirId,
//           memoryId,
//           file: photo.file,
//           kind: "photo",
//           mimeType: photo.file.type,
//           caption: photo.caption || undefined,
//           originalFilename: photo.file.name,
//         });
//       }

//       // 4. Submit only if this was a fresh draft.
//       // Editing an already-submitted memory only needs a patch.
//       if (!isEditMode) {
//         await submit.mutateAsync(memoryId);
//         await clearDraft(memoryId);
//       }

//       // Cleanup object URLs
//       audioClips.forEach((clip) => URL.revokeObjectURL(clip.url));
//       photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));

//       onClose();
//     } catch (error) {
//       const message = isApiError(error)
//         ? error.code === "network"
//           ? "Connection lost during upload. Your text is safe. Please try again."
//           : error.message
//         : "Something went wrong during submission. Your text is safe. Please try again.";

//       setUploadError(message);
//     } finally {
//       setUploading(false);
//     }
//   }

//   const existingPhotos = existingMedia.filter((m) => m.kind === "photo");
//   const existingAudios = existingMedia.filter((m) => m.kind === "audio");

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-2xl">
//         <header className="flex items-center justify-between border-b border-amber-900/10 px-6 py-4">
//           <h2 className="font-heading text-xl text-amber-950">
//             {isEditMode ? "Edit memory" : "Add memory"}
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close memory composer"
//             className="text-amber-900/60 hover:text-amber-900"
//           >
//             <X className="size-5" />
//           </button>
//         </header>

//         <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
//           <div className="space-y-2">
//             <Label htmlFor="memory-title">Title</Label>
//             <Input
//               id="memory-title"
//               value={title}
//               onChange={(event) => setTitle(event.target.value)}
//               placeholder="Enter title name"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="memory-body">Description</Label>
//             <textarea
//               id="memory-body"
//               value={bodyText}
//               onChange={(event) => setBodyText(event.target.value)}
//               placeholder="Enter details about memory"
//               className="min-h-32 w-full rounded-lg border border-amber-900/20 bg-white px-3 py-2 text-sm text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
//             />
//           </div>

//           {/* Existing audio attachments (edit mode) */}
//           {existingAudios.length > 0 && (
//             <div className="space-y-2">
//               <Label>Voice notes already attached</Label>
//               <ul className="space-y-2">
//                 {existingAudios.map((asset) => (
//                   <li
//                     key={asset.id}
//                     className="flex flex-col gap-2 rounded-xl bg-amber-900/10 p-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
//                   >
//                     <div className="flex items-center gap-2">
//                       <Volume2 className="size-4 text-amber-900" />
//                       <span className="font-medium">
//                         {asset.duration_ms
//                           ? `${Math.round(asset.duration_ms / 1000)}s recording`
//                           : "Voice note"}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <audio
//                         controls
//                         src={asset.playback_url}
//                         className="h-8 w-48"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveExistingMedia(asset.id)}
//                         aria-label="Remove voice note"
//                         className="rounded-full bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
//                       >
//                         <Trash2 className="size-4" />
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label>Add voice note</Label>
//             <VoiceRecorder
//               onSave={(clip) => setAudioClips((previous) => [...previous, clip])}
//             />

//             {audioClips.length > 0 && (
//               <ul className="space-y-2 pt-2">
//                 {audioClips.map((clip, index) => (
//                   <li
//                     key={`${clip.url}-${index}`}
//                     className="flex flex-col gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
//                   >
//                     <div className="flex items-center gap-2">
//                       <Volume2 className="size-4 text-emerald-700" />
//                       <span className="font-medium">
//                         New voice note {index + 1} (
//                         {Math.round(clip.durationMs / 1000)}s)
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <audio controls src={clip.url} className="h-8 w-48" />
//                       <button
//                         type="button"
//                         onClick={() => {
//                           URL.revokeObjectURL(clip.url);
//                           setAudioClips((previous) =>
//                             previous.filter((_, itemIndex) => itemIndex !== index),
//                           );
//                         }}
//                         aria-label={`Remove new voice note ${index + 1}`}
//                         className="rounded-full bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
//                       >
//                         <X className="size-4" />
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Existing photos (edit mode) */}
//           {existingPhotos.length > 0 && (
//             <div className="space-y-2">
//               <Label>Photographs already attached</Label>
//               <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
//                 {existingPhotos.map((asset) => (
//                   <div key={asset.id} className="space-y-2">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={asset.playback_url}
//                       alt={asset.caption ?? "Memory photo"}
//                       className="h-32 w-full rounded-lg object-cover"
//                     />
//                     {asset.caption && (
//                       <p className="line-clamp-2 text-xs text-amber-900/70">
//                         {asset.caption}
//                       </p>
//                     )}
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => handleRemoveExistingMedia(asset.id)}
//                     >
//                       <Trash2 className="size-3" /> Remove
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label>Add photograph</Label>
//             <ImagePicker images={photos} onChange={setPhotos} />
//           </div>

//           {uploadError && (
//             <div
//               className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
//               role="alert"
//             >
//               {uploadError}
//             </div>
//           )}
//         </div>

//         <footer className="border-t border-amber-900/10 bg-amber-50 px-6 py-4">
//           <Button
//             type="button"
//             onClick={handleSubmit}
//             disabled={uploading || !hasContent || !memoryId}
//             className="w-full bg-[#65402A] hover:bg-amber-950"
//             size="lg"
//           >
//             {uploading ? (
//               isEditMode
//                 ? "Saving changes…"
//                 : "Submitting memory…"
//             ) : (
//               <>
//                 <Save className="mr-2 size-4" />
//                 {isEditMode ? "Save changes" : "Submit memory"}
//               </>
//             )}
//           </Button>
//         </footer>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-amber-900/10 px-6 py-4">
          <h2 className="font-heading text-xl text-amber-950">
            {isEditMode ? "Edit memory" : "Add memory"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close memory composer"
            className="text-amber-900/60 hover:text-amber-900"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="memory-title">Title</Label>
            <Input
              id="memory-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory-body">Description</Label>
            <textarea
              id="memory-body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter details about memory"
              className="min-h-32 w-full rounded-lg border border-amber-900/20 bg-white px-3 py-2 text-sm text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
            />
          </div>

          {existingAudios.length > 0 && (
            <div className="space-y-2">
              <Label>Voice notes already attached</Label>
              <ul className="space-y-2">
                {existingAudios.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex flex-col gap-2 rounded-xl bg-amber-900/10 p-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4 text-amber-900" />
                      <span className="font-medium">
                        {asset.duration_ms
                          ? `${Math.round(asset.duration_ms / 1000)}s recording`
                          : "Voice note"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
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
                        className="rounded-full bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
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
            <Label>Add voice note</Label>
            <VoiceRecorder
              onSave={(clip) => setAudioClips((prev) => [...prev, clip])}
            />
            {audioClips.length > 0 && (
              <ul className="space-y-2 pt-2">
                {audioClips.map((clip, index) => (
                  <li
                    key={`${clip.url}-${index}`}
                    className="flex flex-col gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4 text-emerald-700" />
                      <span className="font-medium">
                        New voice note {index + 1} (
                        {Math.round(clip.durationMs / 1000)}s)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
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
                        className="rounded-full bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Photographs already attached</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {existingPhotos.map((asset) => (
                  <div key={asset.id} className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.playback_url}
                      alt={asset.caption ?? "Memory photo"}
                      loading="lazy"
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    {asset.caption && (
                      <p className="line-clamp-2 text-xs text-amber-900/70">
                        {asset.caption}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveExistingMedia(asset.id)}
                    >
                      <Trash2 className="size-3" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Add photograph</Label>
            <ImagePicker images={photos} onChange={setPhotos} />
          </div>

          {uploadError && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {uploadError}
            </div>
          )}
        </div>

        <footer className="border-t border-amber-900/10 bg-amber-50 px-6 py-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || !hasContent}
            className="w-full bg-[#65402A] hover:bg-amber-950"
            size="lg"
          >
            {uploading ? (
              progressLabel ?? (isEditMode ? "Saving changes…" : "Submitting memory…")
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEditMode ? "Save changes" : "Submit memory"}
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}