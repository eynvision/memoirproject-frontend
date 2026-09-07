"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

export type RecordedClip = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
  url: string;
};

export function VoiceRecorder({
  onSave,
}: {
  onSave: (clip: RecordedClip) => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [clip, setClip] = useState<RecordedClip | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const onSaveRef = useRef(onSave);

  // Keep the latest onSave without re-binding recorder events.
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalDuration = Math.max(
          1000,
          Math.round(Date.now() - startTimeRef.current - totalPausedTimeRef.current)
        );
        setDurationMs(finalDuration);

        const rawMime = recorder.mimeType || mimeType;
        const cleanMime = rawMime.split(";")[0].trim() || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: cleanMime });

        const c: RecordedClip = {
          blob,
          durationMs: finalDuration,
          mimeType: cleanMime,
          url: URL.createObjectURL(blob),
        };
        setClip(c);
        setState("stopped");

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        // Auto-attach on stop. User can still remove/re-record.
        onSaveRef.current(c);
        // Reset UI immediately so the recorder is ready for another take.
        setClip(null);
        setDurationMs(0);
        chunksRef.current = [];
        setState("idle");
      };

      recorder.start(200);
      recorderRef.current = recorder;

      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      pauseStartRef.current = 0;
      setDurationMs(0);
      setError(null);
      setState("recording");

      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - totalPausedTimeRef.current;
        setDurationMs(Math.max(0, elapsed));
      }, 100);
    } catch {
      setError("Microphone access is needed to record. Please check your browser permissions.");
    }
  }

  function pause() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      pauseStartRef.current = Date.now();
      if (timerRef.current) window.clearInterval(timerRef.current);
      setState("paused");
    }
  }

  function resume() {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      if (pauseStartRef.current > 0) {
        totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      setState("recording");
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - totalPausedTimeRef.current;
        setDurationMs(Math.max(0, elapsed));
      }, 100);
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      if (recorderRef.current.state === "paused" && pauseStartRef.current > 0) {
        totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      recorderRef.current.stop();
    }
  }

  const seconds = Math.floor(durationMs / 1000);

  return (
    <div className="space-y-3 rounded-xl border border-paper-400 bg-paper-000 p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-ember-100">
          <Mic
            className={`size-5 ${
              state === "recording"
                ? "animate-pulse text-ember-600"
                : "text-ember-500"
            }`}
            strokeWidth={1.5}
          />
        </div>
        <div
          className={`flex-1 text-sm font-medium ${
            state === "idle" ? "text-ink-500" : "text-ink-700"
          }`}
        >
          {state === "idle" && "Ready to record"}
          {state === "recording" && `Recording… ${formatTime(seconds)}`}
          {state === "paused" && `Paused at ${formatTime(seconds)}`}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {state === "idle" && (
          <Button type="button" onClick={start} size="sm">
            <Mic className="size-4" /> Start recording
          </Button>
        )}
        {state === "recording" && (
          <>
            <Button type="button" onClick={pause} variant="outline" size="sm">
              <Pause className="size-4" /> Pause
            </Button>
            <Button type="button" onClick={stop} size="sm">
              <Square className="size-4" /> Stop
            </Button>
          </>
        )}
        {state === "paused" && (
          <>
            <Button type="button" onClick={resume} size="sm">
              <Play className="size-4" /> Resume
            </Button>
            <Button type="button" onClick={stop} variant="outline" size="sm">
              <Square className="size-4" /> Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function pickMime(): string {
  const candidates = [
    "audio/mp4",
    "audio/aac",
    "audio/wav",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return "audio/webm";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}