"use client";

import { useRef, useState } from "react";
import { Pencil, Play, Pause } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Memory } from "@/features/memory/schemas";
import { formatDate } from "@/utils/date";

export function MemoryCard({
  memory,
  currentUserId,
  onEdit,
}: {
  memory: Memory;
  currentUserId: string;
  onEdit?: (memory: Memory) => void;
}) {
  const firstPhoto = memory.media.find((m) => m.kind === "photo");
  const firstAudio = memory.media.find((m) => m.kind === "audio");

  const photoCount = memory.media.filter((m) => m.kind === "photo").length;
  const audioCount = memory.media.filter((m) => m.kind === "audio").length;

  return (
    <article className="mb-6 break-inside-avoid rounded-xl border border-paper-400 bg-paper-000 p-5 shadow-e1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-[19px] leading-snug text-ink-900">
          {memory.title || "Untitled memory"}
        </h3>
        {onEdit && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(memory)}
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {firstPhoto && (
        <div className="mt-4">
          <div className="overflow-hidden rounded-md bg-white p-1 shadow-e1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstPhoto.playback_url}
              alt={firstPhoto.caption ?? memory.title ?? "Memory photo"}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm object-cover"
            />
          </div>
          {photoCount > 1 && (
            <p className="mt-1.5 text-xs text-ink-400">
              +{photoCount - 1} more photograph{photoCount - 1 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {firstAudio && (
        <div className="mt-4">
          <AudioPlayer
            src={firstAudio.playback_url}
            durationMs={firstAudio.duration_ms}
          />
          {audioCount > 1 && (
            <p className="mt-1.5 text-xs text-ink-400">
              +{audioCount - 1} more recording{audioCount - 1 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {memory.body_text && (
        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink-500">
          {memory.body_text}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-paper-400 pt-3 text-[13px] tabular-nums text-ink-400">
        <span>{currentUserId === "owner" ? "By you" : "By contributor"}</span>
        <span>{formatDate(memory.created_at)}</span>
      </div>
    </article>
  );
}

/**
 * Minimal presentational player: round play button + flat progress track.
 * Replaces the browser-native <audio controls> chrome, which is the single
 * most "dashboard-looking" element on these cards.
 */
function AudioPlayer({
  src,
  durationMs,
}: {
  src: string;
  durationMs?: number | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    el.play().catch(() => {
      // Autoplay/route issues — silently ignore; user can retry.
    });
  }

  const totalSeconds = durationMs ? Math.round(durationMs / 1000) : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-paper-400 bg-paper-100/60 p-2.5">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause recording" : "Play recording"}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-600 transition-colors hover:bg-ember-500 hover:text-paper-000"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>

      <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-paper-400">
        <div
          className="h-full rounded-full bg-ember-500 transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {totalSeconds !== null && (
        <span className="shrink-0 text-xs tabular-nums text-ink-400">
          {formatTime(totalSeconds)}
        </span>
      )}

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={(e) => {
          setPlaying(false);
          setProgress(0);
          e.currentTarget.currentTime = 0;
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration > 0) setProgress(el.currentTime / el.duration);
        }}
      />
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}