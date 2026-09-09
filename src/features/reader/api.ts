import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import {
  commentNodeSchema,
  reactionToggleOutSchema,
  searchOutSchema,
  shareLinkSchema,
} from "./schemas";

const endpoints = {
  comments: (m: string) => `/public/memoirs/${m}/comments`,
  comment: (m: string, c: string) => `/memoirs/${m}/comments/${c}`,
  reactions: (m: string) => `/public/memoirs/${m}/reactions`,
  search: (m: string, q: string) =>
    `/public/memoirs/${m}/search?q=${encodeURIComponent(q)}`,
  shareLink: (m: string) => `/memoirs/${m}/share-link`,
} as const;

export async function postComment(
  memoirId: string,
  body: {
    memory_id: string;
    body: string;
    author_name: string;
    parent_comment_id?: string | null;
  }
) {
  return apiRequest({
    path: endpoints.comments(memoirId),
    method: "POST",
    body,
    schema: commentNodeSchema,
  });
}

export async function deleteComment(memoirId: string, commentId: string) {
  await apiRequest({
    path: endpoints.comment(memoirId, commentId),
    method: "DELETE",
    schema: z.unknown(),
  });
}

export async function toggleReaction(
  memoirId: string,
  body: {
    target_type: "memory" | "comment";
    target_id: string;
    kind: string;
    author_name: string;
  }
) {
  return apiRequest({
    path: endpoints.reactions(memoirId),
    method: "POST",
    body,
    schema: reactionToggleOutSchema,
  });
}

export async function searchBook(memoirId: string, query: string) {
  return apiRequest({
    path: endpoints.search(memoirId, query),
    schema: searchOutSchema,
  });
}

export async function getShareLink(memoirId: string) {
  return apiRequest({
    path: endpoints.shareLink(memoirId),
    schema: shareLinkSchema,
  });
}

export async function requestPdfExport(memoirId: string) {
  return apiRequest({
    path: `/memoirs/${memoirId}/export/pdf`,
    method: "POST",
    schema: z.object({
      export_id: z.string().uuid(),
      status: z.string(),
    }),
  });
}

export async function getPdfExportStatus(memoirId: string, exportId: string) {
  return apiRequest({
    path: `/memoirs/${memoirId}/export/pdf/${exportId}`,
    schema: z.object({
      id: z.string().uuid(),
      status: z.string(),
      download_url: z.string().url().optional(),
      created_at: z.string(),
      completed_at: z.string().nullish(),
      error_message: z.string().nullish(),
    }),
  });
}