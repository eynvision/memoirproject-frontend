const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") || localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// If the backend rejects a request because the logged-in user has no
// participant record on the cached memoir (a stale/mismatched
// "active_memoir" left over from a previous account in this browser),
// clear the stale local state and send them back to log in instead of
// leaving them stuck on a raw 403.
function isStaleMemoirAccessError(detail: unknown): boolean {
  if (typeof detail !== "string") return false;
  return (
    detail.includes("not an active participant") ||
    detail.includes("participation in this memoir has been revoked")
  );
}

async function handleStaleMemoirAccess(res: Response) {
  if (res.status !== 403 || typeof window === "undefined") return;
  try {
    const body = await res.clone().json();
    if (isStaleMemoirAccessError(body?.detail)) {
      localStorage.removeItem("active_memoir");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      // Hard navigation is intentional: this is a plain module (no
      // useRouter available) and we want a full reload to drop any
      // stale in-memory state left over from the mismatched account.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  } catch {
    // Not a JSON body, or already consumed — nothing to recover from here.
  }
}

// Centralized wrapper to make sure every request sent to your
// FastAPI backend is properly formatted, secure, and pointed to the right address
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  await handleStaleMemoirAccess(res);
  return res;
}

interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
}

interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
  message?: string;
}

function parseErrorDetail(errData: ApiErrorResponse | null | undefined, defaultMessage: string): string {
  if (!errData) return defaultMessage;
  if (typeof errData.detail === "string") return errData.detail;

  if (Array.isArray(errData.detail)) {
    return errData.detail
      .map((err: ApiErrorDetail) => {
        const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : "Field";
        return `${field}: ${err.msg || "Invalid value"}`;
      })
      .join(" | ");
  }

  if (errData.message) return errData.message;
  return defaultMessage;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface MemoirEntity {
  id: string;
  subject_name: string;
  subject_born_on?: string | null;
  subject_died_on?: string | null;
  subject_is_living: boolean;
  description?: string | null;
  visibility: string;
  comment_policy: string;
  created_by_user_id: string;
  status: "draft" | "published";
  role?: string;
  created_at?: string;
}

export interface MemoirCreatePayload {
  subject_name: string;
  subject_born_on?: string;
  subject_died_on?: string;
  subject_is_living: boolean;
  description?: string;
  visibility?: string;
  comment_policy?: string;
  relationship?: string;
}

export interface MemoryCreatePayload {
  memoir_id: string;
  title: string;
  body_text?: string | null;
  status?: string;
  occurred_start?: string | null;
  occurred_end?: string | null;
  occurred_precision?: string | null;
  date_source?: string | null;
  media_asset_ids?: string[];
}

export interface PresignedUrlPayload {
  memoir_id: string;
  filename: string;
  file_type: string;
  kind: string;
}

export interface MediaMetadataPayload {
  memoir_id: string;
  storage_key: string;
  kind: string;
  mime_type: string;
  byte_size: number;
  original_filename: string;
  caption?: string;
  width_px?: number;
  height_px?: number;
  duration_ms?: number | null;
}

export interface CommentEntity {
  id: string;
  memoir_id: string;
  memory_id: string | null;
  media_asset_id: string | null;
  parent_comment_id: string | null;
  author_participant_id: string;
  body: string;
  created_at: string;
  hidden_at: string | null;
  hidden_by_participant_id: string | null;
  deleted_at: string | null;
  author_name?: string;
}

export interface CommentCreatePayload {
  memoir_id: string;
  memory_id?: string | null;
  media_asset_id?: string | null;
  author_participant_id?: string | null;
  parent_comment_id?: string | null;
  body: string;
}

export interface ChapterProposalPayload {
  chapters: {
    title: string;
    summary?: string; // Added summary
    memories: { id: string; title: string; date: string | null }[];
  }[];
}

export interface ChapterPhotoEntity {
  id: string;
  url: string;
  caption?: string | null;
}

export interface ChapterMemoryEntity {
  id: string;
  memoir_id: string;
  title: string | null;
  body_text: string | null;
  rewritten_text?: string | null;
  photos?: ChapterPhotoEntity[];
  occurred_start: string | null;
  occurred_precision: string | null;
}

export interface ChapterEntity {
  id: string;
  memoir_id: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  status: "draft" | "published";
  sort_order: number;
  confidence: number | null;
  memories: ChapterMemoryEntity[];
}

export interface GenerationStatusEntity {
  memoir_id: string;
  generation_id?: string;
  status: "idle" | "running" | "completed" | "failed";
  memory_count?: number;
  error_message?: string;
  started_at?: string;
  finished_at?: string;
}

export interface ChapterUpdatePayload {
  title?: string;
  subtitle?: string;
  summary?: string;
}

export interface MemoryUpdatePayload {
  title?: string;
  body_text?: string;
}

export interface ChatActionEntity {
  id: string;
  action_type: string;
  summary: string;
  status: "pending" | "processing" | "applied" | "rejected" | "failed";
  error?: string | null;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  text: string;
}

export interface ChatHistoryEntity {
  messages: ChatHistoryItem[];
  pending_actions: ChatActionEntity[];
}

export interface ChatReplyEntity {
  reply: string;
  pending_actions: ChatActionEntity[];
}

export interface NarrativeStatusEntity {
  status: "idle" | "running" | "completed" | "failed";
  error?: string | null;
}

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const errData: ApiErrorResponse = await res.json().catch(() => ({}));
    throw new Error(parseErrorDetail(errData, fallback));
  }
  const json = await res.json();
  return (json.data || json) as T;
}

export const api = {
  async signup(payload: SignupPayload) {
    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Signup failed"));
    }
    return res.json();
  },

  async login(payload: { email: string; password: string }) {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Login failed"));
    }
    return res.json();
  },

  async createMemoir(payload: MemoirCreatePayload) {
    const res = await apiFetch("/api/memoirs/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to create memoir"));
    }
    return res.json();
  },

  async getLiveMemoir(memoirId: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/live`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch live memoir data");
    const json = await res.json();
    return json.data || json;
  },

  // Lets a returning user recover their memoir(s) after login without
  // relying on a cached active_memoir from a prior signup/onboarding flow.
  async getMyMemoirs(): Promise<MemoirEntity[]> {
    const res = await apiFetch("/api/memoirs/mine", {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch your memoirs");
    const json = await res.json();
    return json.data || json;
  },

  // Aligned with backend prefix /api/memories/feed/{memoir_id}
  async getMemoirFeed(memoirId: string) {
    const res = await apiFetch(`/api/memories/feed/${memoirId}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch memoir feed");
    const json = await res.json();
    return json.data || json;
  },

  async createMemory(payload: MemoryCreatePayload) {
    const res = await apiFetch("/api/memories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to create memory"));
    }
    return res.json();
  },

  async deleteMemory(memoryId: string) {
    const res = await apiFetch(`/api/memories/${memoryId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete memory");
    return res.json();
  },

  async getPresignedUrl(payload: PresignedUrlPayload) {
    const res = await apiFetch("/api/media/presigned-url", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to get presigned URL"));
    }

    const responseJson = await res.json();
    return responseJson.data || responseJson;
  },

  async registerMediaMetadata(payload: MediaMetadataPayload) {
    const res = await apiFetch("/api/media/metadata", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to register media metadata"));
    }

    const responseJson = await res.json();
    return responseJson.data || responseJson;
  },

  async getComments(memoryId: string): Promise<CommentEntity[]> {
    const res = await apiFetch(`/api/comments/?memory_id=${memoryId}`, {
      method: "GET",
    });

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to fetch comments"));
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.comments || [];
  },

  async createComment(payload: CommentCreatePayload): Promise<CommentEntity> {
    const res = await apiFetch("/api/comments/", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to post comment"));
    }

    const data = await res.json();
    return data.comment || data;
  },

  async requestMemoirExport(memoirId: string) {
    if (!memoirId) {
      throw new Error("No active memoir ID found.");
    }

    const res = await apiFetch(`/api/memoirs/${memoirId}/export`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Backend export error response:", errorBody);
      throw new Error(`Failed to initiate PDF export: ${res.status} ${res.statusText}`);
    }

    return res.json();
  },

  async getLatestExportStatus(memoirId: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/export/latest`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error("Failed to check export status.");
    }

    return res.json();
  },

  async searchMemories(memoirId: string, query: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to search archive");
    const json = await res.json();
    return json.data || json;
  },

   async proposeChapters(memoirId: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters/propose`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to generate AI chapter proposal");
    const json = await res.json();
    return json.data;
  },

  // ADD THIS NEW METHOD
  async refineChapters(memoirId: string, currentProposal: ChapterProposalPayload, prompt: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters/refine`, {
      method: "POST",
      body: JSON.stringify({ current_proposal: currentProposal, user_prompt: prompt }),
    });
    if (!res.ok) throw new Error("Failed to refine AI chapter proposal");
    const json = await res.json();
    return json.data;
  },

  async applyChapters(memoirId: string, payload: ChapterProposalPayload) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters/apply`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to apply chapter layout");
    return res.json();
  },

  // AI Memoir Organisation (chapters)
  async generateChapters(memoirId: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/generate`, {
      method: "POST",
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to start chapter generation"));
    }
    const json = await res.json();
    return json.data || json;
  },

  async getGenerationStatus(memoirId: string): Promise<GenerationStatusEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/generation-status`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch generation status");
    const json = await res.json();
    return json.data || json;
  },

  async getChapters(memoirId: string, status?: "draft" | "published"): Promise<ChapterEntity[]> {
    const qs = status ? `?status=${status}` : "";
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters${qs}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch chapters");
    const json = await res.json();
    return json.data || json;
  },

  async updateChapter(memoirId: string, chapterId: string, payload: ChapterUpdatePayload): Promise<ChapterEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters/${chapterId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to update chapter"));
    }
    const json = await res.json();
    return json.data || json;
  },

  async reorderChapterMemories(memoirId: string, chapterId: string, memoryIds: string[]): Promise<ChapterEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chapters/${chapterId}/memory-order`, {
      method: "PATCH",
      body: JSON.stringify({ memory_ids: memoryIds }),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to reorder memories"));
    }
    const json = await res.json();
    return json.data || json;
  },

  async updateMemory(memoirId: string, memoryId: string, payload: MemoryUpdatePayload) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/memories/${memoryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to update memory"));
    }
    const json = await res.json();
    return json.data || json;
  },

  async publishMemoir(memoirId: string) {
    const res = await apiFetch(`/api/memoirs/${memoirId}/publish`, {
      method: "POST",
    });
    if (!res.ok) {
      const errData: ApiErrorResponse = await res.json().catch(() => ({}));
      throw new Error(parseErrorDetail(errData, "Failed to publish memoir"));
    }
    const json = await res.json();
    return json.data || json;
  },

  // Clio chat agent + narrative (rewrite) layer
  async getChatHistory(memoirId: string): Promise<ChatHistoryEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chat`, { method: "GET" });
    return unwrap(res, "Failed to load the conversation");
  },

  async sendChatMessage(memoirId: string, message: string): Promise<ChatReplyEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return unwrap(res, "Clio is unavailable right now");
  },

  async confirmChatAction(memoirId: string, actionId: string): Promise<ChatActionEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chat/actions/${actionId}/confirm`, { method: "POST" });
    return unwrap(res, "Failed to apply this change");
  },

  async rejectChatAction(memoirId: string, actionId: string): Promise<ChatActionEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/chat/actions/${actionId}/reject`, { method: "POST" });
    return unwrap(res, "Failed to discard this change");
  },

  async getNarrativeStatus(memoirId: string): Promise<NarrativeStatusEntity> {
    const res = await apiFetch(`/api/memoirs/${memoirId}/narrative-status`, { method: "GET" });
    return unwrap(res, "Failed to fetch narrative status");
  },
};
