import { describe, it, expect } from "vitest";
import {
  normalizeMemory,
  memoryInputSchema,
  chapterSchema,
  backendAssetSchema,
  normalizedMemorySchema,
} from "./memory";
import type { BackendMemory } from "./memory";

describe("memoryInputSchema", () => {
  it("accepts a valid input", () => {
    const result = memoryInputSchema.safeParse({
      title: "A memory",
      body_text: "Some text",
      occurred_start: "2026-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = memoryInputSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("defaults body_text to empty string", () => {
    const result = memoryInputSchema.parse({ title: "Hello" });
    expect(result.body_text).toBe("");
  });

  it("allows null occurred_start", () => {
    const result = memoryInputSchema.safeParse({
      title: "Hello",
      occurred_start: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("chapterSchema", () => {
  it("accepts a valid chapter", () => {
    const result = chapterSchema.safeParse({
      id: "ch1",
      title: "Chapter 1",
      memoir_id: "m1",
      sort_order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("requires id and title", () => {
    const result = chapterSchema.safeParse({ memoir_id: "m1" });
    expect(result.success).toBe(false);
  });
});

describe("backendAssetSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = backendAssetSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a transcript object", () => {
    const result = backendAssetSchema.safeParse({
      kind: "audio",
      transcript: { display_text: "Hello", raw_text: "Hello world" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a transcript array", () => {
    const result = backendAssetSchema.safeParse({
      kind: "audio",
      transcript: [{ display_text: "Line 1" }, { display_text: "Line 2" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("normalizedMemorySchema", () => {
  it("accepts a valid normalized memory", () => {
    const result = normalizedMemorySchema.safeParse({
      id: "1",
      title: "Test",
      content: "Body",
      date: "2026-01-01",
      kind: "text",
      author: "Owner",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid kind", () => {
    const result = normalizedMemorySchema.safeParse({
      id: "1",
      title: "Test",
      content: "Body",
      date: "2026-01-01",
      kind: "video",
      author: "Owner",
    });
    expect(result.success).toBe(false);
  });
});

describe("normalizeMemory", () => {
  it("normalizes a text-only memory", () => {
    const input: BackendMemory = {
      id: "1",
      title: "A day at the park",
      body_text: "We had a picnic.",
      occurred_start: "2026-01-15",
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("text");
    expect(result.title).toBe("A day at the park");
    expect(result.content).toBe("We had a picnic.");
    expect(result.date).toBe("2026-01-15");
    expect(result.author).toBe("Owner");
  });

  it("falls back to 'Untitled' when title is missing", () => {
    const input: BackendMemory = {
      id: "2",
      body_text: "Some content",
    };

    const result = normalizeMemory(input);

    expect(result.title).toBe("Untitled");
  });

  it("falls back to created_at date when occurred_start is missing", () => {
    const input: BackendMemory = {
      id: "3",
      title: "Test",
      created_at: "2026-02-20T10:30:00Z",
    };

    const result = normalizeMemory(input);

    expect(result.date).toBe("2026-02-20");
  });

  it("detects a photo asset and sets mediaUrl", () => {
    const input: BackendMemory = {
      id: "4",
      title: "Photo memory",
      media_assets: [{ kind: "photo", url: "https://example.com/photo.jpg" }],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("photo");
    expect(result.mediaUrl).toBe("https://example.com/photo.jpg");
  });

  it("detects an audio asset and formats duration", () => {
    const input: BackendMemory = {
      id: "5",
      title: "Audio memory",
      media_assets: [
        {
          kind: "audio",
          playback_url: "https://example.com/audio.mp3",
          duration_ms: 65000,
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("audio");
    expect(result.audioUrl).toBe("https://example.com/audio.mp3");
    expect(result.duration).toBe("65s");
  });

  it("marks a memory with text and photo as combined", () => {
    const input: BackendMemory = {
      id: "6",
      title: "Combined",
      body_text: "Look at this",
      media_assets: [{ kind: "photo", url: "https://example.com/photo.jpg" }],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("combined");
  });

  it("detects photo by mime_type when kind is missing", () => {
    const input: BackendMemory = {
      id: "7",
      title: "MIME photo",
      media_assets: [
        { mime_type: "image/jpeg", url: "https://example.com/photo.jpg" },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("photo");
    expect(result.mediaUrl).toBe("https://example.com/photo.jpg");
  });

  it("detects audio by mime_type when kind is missing", () => {
    const input: BackendMemory = {
      id: "8",
      title: "MIME audio",
      media_assets: [
        { mime_type: "audio/webm", playback_url: "https://example.com/a.webm" },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("audio");
  });

  it("reads the nested memory_media shape", () => {
    const input: BackendMemory = {
      id: "9",
      title: "Nested",
      memory_media: [
        { media_asset: { kind: "photo", url: "https://example.com/n.jpg" } },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.kind).toBe("photo");
    expect(result.mediaUrl).toBe("https://example.com/n.jpg");
  });

  it("prefers playback_url over url and signed_url", () => {
    const input: BackendMemory = {
      id: "10",
      title: "Priority",
      media_assets: [
        {
          kind: "photo",
          playback_url: "https://example.com/playback.jpg",
          url: "https://example.com/url.jpg",
          signed_url: "https://example.com/signed.jpg",
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.mediaUrl).toBe("https://example.com/playback.jpg");
  });

  it("falls back to url when playback_url is missing", () => {
    const input: BackendMemory = {
      id: "11",
      title: "Fallback",
      media_assets: [
        {
          kind: "photo",
          url: "https://example.com/url.jpg",
          signed_url: "https://example.com/signed.jpg",
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.mediaUrl).toBe("https://example.com/url.jpg");
  });

  it("extracts transcript from an array", () => {
    const input: BackendMemory = {
      id: "12",
      title: "Transcript array",
      media_assets: [
        {
          kind: "audio",
          playback_url: "https://example.com/a.webm",
          transcript: [{ display_text: "Hello there" }],
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.transcription).toBe("Hello there");
  });

  it("extracts transcript from an object", () => {
    const input: BackendMemory = {
      id: "13",
      title: "Transcript object",
      media_assets: [
        {
          kind: "audio",
          playback_url: "https://example.com/a.webm",
          transcript: { raw_text: "Raw transcript" },
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.transcription).toBe("Raw transcript");
  });

  it("rounds duration to the nearest second", () => {
    const input: BackendMemory = {
      id: "14",
      title: "Rounding",
      media_assets: [
        {
          kind: "audio",
          playback_url: "https://example.com/a.webm",
          duration_ms: 65400,
        },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.duration).toBe("65s");
  });

  it("returns undefined duration when duration_ms is missing", () => {
    const input: BackendMemory = {
      id: "15",
      title: "No duration",
      media_assets: [
        { kind: "audio", playback_url: "https://example.com/a.webm" },
      ],
    };

    const result = normalizeMemory(input);

    expect(result.duration).toBeUndefined();
  });

  it("returns empty date when neither occurred_start nor created_at exist", () => {
    const input: BackendMemory = {
      id: "16",
      title: "No date",
    };

    const result = normalizeMemory(input);

    expect(result.date).toBe("");
  });
});
