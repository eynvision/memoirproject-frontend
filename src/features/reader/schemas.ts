import { z } from "zod";

export const reactionSummarySchema = z.object({
  counts: z.record(z.string(), z.number().int()).default({}),
  mine: z.array(z.string()).default([]),
});

export const bookMediaSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  playback_url: z.string(),
  caption: z.string().nullish(),
  duration_ms: z.number().int().nullish(),
});

export interface CommentNode {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  replies: CommentNode[];
  reactions: z.infer<typeof reactionSummarySchema>;
}

export const commentNodeSchema: z.ZodType<CommentNode> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    author_name: z.string(),
    body: z.string(),
    created_at: z.string(),
    replies: z.array(commentNodeSchema),
    reactions: reactionSummarySchema,
  })
);

export const bookMemorySchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullish(),
  body_text: z.string().nullish(),
  transcript: z.string().nullish(),
  media: z.array(bookMediaSchema).default([]),
  comments: z.array(commentNodeSchema).default([]),
  reactions: reactionSummarySchema,
  comment_reactions: z.record(z.string(), reactionSummarySchema).default({}),
});

export const bookChapterSchema = z.object({
  id: z.string().uuid().nullish(),
  title: z.string(),
  summary: z.string().nullish(),
  sort_order: z.number().int(),
  memories: z.array(bookMemorySchema).default([]),
});

export const bookMemoirSchema = z.object({
  id: z.string().uuid(),
  subject_name: z.string(),
  subject_born_on: z.string().nullish(),
  subject_died_on: z.string().nullish(),
  subject_is_living: z.boolean(),
  description: z.string().nullish(),
  published_at: z.string().nullish(),
});

export const bookOutSchema = z.object({
  memoir: bookMemoirSchema,
  chapters: z.array(bookChapterSchema).default([]),
  media_library: z.array(bookMediaSchema).default([]),
  comments_open: z.boolean(),
  share_token: z.string().nullish(),
});

export const reactionToggleOutSchema = z.object({
  target_type: z.enum(["memory", "comment"]),
  target_id: z.string().uuid(),
  summary: reactionSummarySchema,
});

export const searchOutSchema = z.object({
  hits: z.array(
    z.object({
      memory_id: z.string().uuid(),
      chapter_id: z.string().uuid().nullish(),
      title: z.string().nullish(),
      snippet: z.string(),
    })
  ),
});

export const shareLinkSchema = z.object({ token: z.string() });

export type ReactionSummary = z.infer<typeof reactionSummarySchema>;
export type BookMedia = z.infer<typeof bookMediaSchema>;
export type BookMemory = z.infer<typeof bookMemorySchema>;
export type BookChapter = z.infer<typeof bookChapterSchema>;
export type Book = z.infer<typeof bookOutSchema>;
export type ReactionToggleOut = z.infer<typeof reactionToggleOutSchema>;
export type SearchOut = z.infer<typeof searchOutSchema>;

export const REACTIONS = [
  { key: "with_love", emoji: "❤️", label: "With love" },
  { key: "moved", emoji: "😢", label: "Moved" },
  { key: "thank_you", emoji: "🙏", label: "Thank you" },
  { key: "brings_a_smile", emoji: "😊", label: "Brings a smile" },
] as const;