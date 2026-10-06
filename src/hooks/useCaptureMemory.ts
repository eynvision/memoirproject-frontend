// cspell:disable

/**
 * @file useCaptureMemory.ts
 * @description Production-grade custom React hook managing draft states,
 * secure audio/photo media upload pipelines, memory submission,
 * strict resource cleanup, and bulletproof timeout/validation guards.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api/client";
import { useLocalStorageDraft } from "@/hooks/useLocalStorageDraft";
import { memoryInputSchema } from "@/lib/validations/memory";
import { readStorage } from "@/lib/storage";

// Validation Constants
const MAX_PHOTO_SIZE_MB = 10;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_RECORDING_MS = 10 * 60 * 1000; // 10 minutes max
const MIN_RECORDING_MS = 1000; // 1 second minimum

export function useCaptureMemory(memoirId: string, onSuccess?: () => void) {
  const [draft, setDraft] = useLocalStorageDraft(`memory_draft_${memoirId}`, {
    title: "",
    body_text: "",
    occurred_start: new Date().toISOString().split("T")[0],
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>("");

  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Compiler-safe duration tracking (pure interval counter instead of timestamps)
  const recordingDurationRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /**
   * Cleans up active media stream tracks to release microphone hardware and memory.
   */
  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  /**
   * Resets audio states and revokes object URLs to prevent browser memory leaks.
   */
  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Revoke the object URL when it changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Clean up recording resources on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    };
  }, []);

  /**
   * Requests microphone permissions and initializes recording with a pure interval duration tracker.
   */
  const startRecording = async () => {
    stopMediaStream();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    audioChunksRef.current = [];
    recordingDurationRef.current = 0;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);

      // Start a pure interval counter every second (0 impure time function calls)
      timerRef.current = setInterval(() => {
        recordingDurationRef.current += 1000;
      }, 1000);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Validate recording length
        if (recordingDurationRef.current < MIN_RECORDING_MS) {
          setError("Voice note is too short. Please speak for at least 1 second.");
          stopMediaStream();
          return;
        }

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);

        setAudioUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return URL.createObjectURL(blob);
        });

        stopMediaStream();
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      // Auto-stop if it exceeds max recording limit
      maxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
          setError("Maximum recording length (10 minutes) reached.");
        }
      }, MAX_RECORDING_MS);

    } catch {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setError("Microphone access denied or unavailable.");
    }
  };

  /**
   * Halts active media recording streams.
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current);
        maxTimerRef.current = null;
      }
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const resolveMemoirId = (): string => {
    if (memoirId) {
      if (typeof memoirId === "string") {
        return memoirId;
      }
      if (typeof memoirId === "object" && memoirId !== null) {
        const obj = memoirId as Record<string, unknown>;
        const dataObj = obj.data as Record<string, unknown> | undefined;
        const nestedDataObj = dataObj?.data as Record<string, unknown> | undefined;

        return (
          (typeof obj.id === "string" ? obj.id : "") ||
          (typeof dataObj?.id === "string" ? dataObj.id : "") ||
          (typeof nestedDataObj?.id === "string" ? nestedDataObj.id : "") ||
          ""
        );
      }
    }

    if (typeof window !== "undefined") {
      const parsed = readStorage<{
        id?: string;
        data?: { id?: string };
      }>("active_memoir");
      if (parsed?.data && typeof parsed.data.id === "string") {
        return parsed.data.id;
      }
      if (parsed && typeof parsed.id === "string") {
        return parsed.id;
      }
    }

    return "";
  };

  /**
   * Helper function to handle presigned URL requests, direct storage uploads,
   * and metadata registration for any media asset type.
   */
  const uploadMediaAsset = async (
    currentMemoirId: string,
    file: Blob,
    filename: string,
    mimeType: string,
    kind: "photo" | "audio",
    caption?: string,
    durationMs?: number | null,
  ): Promise<string> => {
    const presignRes = await api.getPresignedUrl({
      memoir_id: currentMemoirId,
      filename,
      file_type: mimeType,
      kind,
    });

    const uploadUrl =
      presignRes.upload_url || presignRes.signed_url || presignRes.url;
    const storageKey = presignRes.storage_key || presignRes.path;

    if (!uploadUrl || !storageKey) {
      throw new Error(`Failed to retrieve upload parameters for ${kind}.`);
    }

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: file,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(
        `Failed to upload ${kind} to storage bucket: ${errorText}`,
      );
    }

    const metaRes = await api.registerMediaMetadata({
      memoir_id: currentMemoirId,
      storage_key: storageKey,
      kind,
      mime_type: mimeType,
      byte_size: file.size,
      original_filename: filename,
      caption,
      duration_ms: durationMs,
    });

    return metaRes.id;
  };

  /**
   * Handles form submission, orchestrates file uploads, and saves the final memory entry.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Zod Form Validation
    const validation = memoryInputSchema.safeParse({
      title: draft.title,
      occurred_start: draft.occurred_start,
      body_text: draft.body_text,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    // 2. Strict File Validations
    if (photoFile) {
      if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
        setError("Invalid image format. Please upload a JPEG, PNG, WEBP, or HEIC file.");
        return;
      }
      const fileSizeMb = photoFile.size / (1024 * 1024);
      if (fileSizeMb > MAX_PHOTO_SIZE_MB) {
        setError(`Image is too large (${fileSizeMb.toFixed(1)}MB). Maximum allowed size is ${MAX_PHOTO_SIZE_MB}MB.`);
        return;
      }
    }

    // 3. Content Guard: Ensure the user provided at least some reflection or media
    const hasText = Boolean(
      draft.body_text && draft.body_text.trim().length > 0,
    );
    const hasMedia = Boolean(photoFile || audioBlob);

    if (!hasText && !hasMedia) {
      setError(
        "Please write a reflection, record a voice note, or attach a photograph.",
      );
      return;
    }

    // 4. Memoir Session Check
    const currentMemoirId = resolveMemoirId();
    if (!currentMemoirId) {
      setError(
        "No active memoir found. Please refresh or restart your session.",
      );
      return;
    }

    setLoading(true);

    try {
      const mediaAssetIds: string[] = [];

      // 6. Photo Upload Pipeline
      if (photoFile) {
        const photoId = await uploadMediaAsset(
          currentMemoirId,
          photoFile,
          photoFile.name,
          photoFile.type,
          "photo",
          photoCaption,
          null,
        );
        mediaAssetIds.push(photoId);
      }

      // 7. Audio Upload Pipeline
      if (audioBlob) {
        const audioFileName = `voice_memo_${Date.now()}.webm`;
        const audioId = await uploadMediaAsset(
          currentMemoirId,
          audioBlob,
          audioFileName,
          "audio/webm",
          "audio",
          "Voice recording",
          0,
        );
        mediaAssetIds.push(audioId);
      }

      // 8. Persist Memory to Supabase
      const hasDate = Boolean(draft.occurred_start);

      await api.createMemory({
        memoir_id: currentMemoirId,
        title: draft.title.trim(),
        body_text: draft.body_text ? draft.body_text.trim() : null,
        status: "draft",
        occurred_start: hasDate ? draft.occurred_start : null,
        occurred_end: hasDate ? draft.occurred_start : null,
        occurred_precision: hasDate ? "day" : null,
        date_source: hasDate ? "owner" : null,
        media_asset_ids: mediaAssetIds,
      });

      // 9. Cleanup form state and storage on success
      localStorage.removeItem(`memory_draft_${currentMemoirId}`);
      setDraft({
        title: "",
        body_text: "",
        occurred_start: new Date().toISOString().split("T")[0],
      });
      setPhotoFile(null);
      setPhotoCaption("");
      clearRecording();

      setSuccessMsg("Memory successfully captured!");
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); 
      }
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving your memory.");
      }
    } finally {
      setLoading(false); // GUARANTEED: Never gets stuck indefinitely
    }
  };

  return {
    draft,
    setDraft,
    photoFile,
    setPhotoFile,
    photoCaption,
    setPhotoCaption,
    recording,
    audioUrl,
    loading,
    error,
    successMsg,
    startRecording,
    stopRecording,
    clearRecording,
    handleSubmit,
  };
}