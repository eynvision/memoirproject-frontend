import { z } from "zod";

// 1. Input Validation Schema (Used for capturing/creating memories)
export const memoryInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please provide a title for this memory."),
  occurred_start: z
    .string()
    .optional()
    .nullable(),
  body_text: z.string().optional().default(""),
});

// 2. Chapter Schema (Replaces `any[]` for chapters)
export const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  memoir_id: z.string().optional(),
  sort_order: z.number().optional(),
});

export type Chapter = z.infer<typeof chapterSchema>;

// 3. Backend Asset Schema (Photos, Audio, Transcripts)
export const backendAssetSchema = z.object({
  kind: z.string().optional(),
  mime_type: z.string().optional(),
  playback_url: z.string().optional(),
  url: z.string().optional(),
  signed_url: z.string().optional(),
  duration_ms: z.number().optional(),
  transcript: z.union([
    z.object({
      display_text: z.string().optional(),
      raw_text: z.string().optional(),
    }),
    z.array(
      z.object({
        display_text: z.string().optional(),
        raw_text: z.string().optional(),
      })
    ),
  ]).optional(),
});

// 4. Backend Memory Schema (Raw response from Supabase/API)
export const backendMemorySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  body_text: z.string().optional(),
  occurred_start: z.string().optional(),
  created_at: z.string().optional(),
  chapter_id: z.string().optional(),
  media_assets: z.array(backendAssetSchema).optional(),
  memory_media: z.array(
    z.union([
      z.object({ media_asset: backendAssetSchema.optional() }),
      backendAssetSchema,
    ])
  ).optional(),
});

export type BackendMemory = z.infer<typeof backendMemorySchema>;

// 5. Normalized Frontend Memory Schema (Used across Dashboard & Contributor views)
export const normalizedMemorySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  kind: z.enum(["text", "photo", "combined", "audio"]),
  author: z.string(),
  chapter_id: z.string().optional(),
  mediaUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  transcription: z.string().optional(),
  duration: z.string().optional(),
});

export type NormalizedMemory = z.infer<typeof normalizedMemorySchema>;

/**
 * Single Source of Truth: Normalizes raw backend memory data into clean frontend items.
 */
export function normalizeMemory(item: BackendMemory): NormalizedMemory {
  const mediaList = item.media_assets || 
    (Array.isArray(item.memory_media) 
      ? item.memory_media.map((mm) => ('media_asset' in mm ? mm.media_asset : mm)).filter(Boolean) as z.infer<typeof backendAssetSchema>[]
      : []);

  const photoAsset = mediaList.find((m) => m.kind === 'photo' || m.kind === 'image' || m.mime_type?.includes('image'));
  const audioAsset = mediaList.find((m) => m.kind === 'audio' || m.mime_type?.includes('audio'));

  const hasText = Boolean(item.body_text && item.body_text.trim().length > 0);
  const hasPhoto = Boolean(photoAsset);
  const hasAudio = Boolean(audioAsset);

  let kind: 'text' | 'photo' | 'combined' | 'audio' = 'text';
  const mediaCount = (hasText ? 1 : 0) + (hasPhoto ? 1 : 0) + (hasAudio ? 1 : 0);
  
  if (mediaCount > 1) {
    kind = 'combined';
  } else if (hasAudio) {
    kind = 'audio';
  } else if (hasPhoto) {
    kind = 'photo';
  }

  const getUrl = (asset?: z.infer<typeof backendAssetSchema>) => asset ? (asset.playback_url || asset.url || asset.signed_url) : undefined;
  
  const transcriptObj = Array.isArray(audioAsset?.transcript) ? audioAsset?.transcript[0] : audioAsset?.transcript;
  const transcriptText = transcriptObj?.display_text || transcriptObj?.raw_text || undefined;

  return {
    id: item.id,
    title: item.title || "Untitled",
    content: item.body_text || "", 
    date: item.occurred_start || item.created_at?.split("T")[0] || "",
    kind,
    author: "Owner",
    chapter_id: item.chapter_id,
    mediaUrl: getUrl(photoAsset), 
    audioUrl: getUrl(audioAsset), 
    transcription: transcriptText,
    duration: audioAsset?.duration_ms ? `${Math.round(audioAsset.duration_ms / 1000)}s` : undefined,
  };
}