"use client";

import { Pencil, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Memory } from "@/features/memory/schemas";

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
  const dateStr = new Date(memory.created_at).toLocaleDateString();

  const durationSec = firstAudio?.duration_ms
    ? Math.round(firstAudio.duration_ms / 1000)
    : null;

  const photoCount = memory.media.filter((m) => m.kind === "photo").length;
  const audioCount = memory.media.filter((m) => m.kind === "audio").length;

  return (
    <article className="flex flex-col rounded-2xl bg-[#F3E8DA] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-xl text-amber-950">
          {memory.title || "Untitled memory"}
        </h3>
        {onEdit && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(memory)}
            className="rounded-lg border-amber-900/20 bg-white/60 text-amber-900 hover:bg-white"
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {firstPhoto && (
        <div className="mt-3 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstPhoto.playback_url}
            alt={firstPhoto.caption ?? memory.title ?? "Memory photo"}
            loading="lazy"
            className="h-48 w-full object-cover"
          />
          {photoCount > 1 && (
            <p className="mt-1 text-xs text-amber-900/60">
              +{photoCount - 1} more photograph{photoCount - 1 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {firstAudio && (
        <div className="mt-3 space-y-2 rounded-xl border border-amber-900/10 bg-white/80 p-3 shadow-sm">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-amber-950">
            <span className="flex items-center gap-1.5">
              <Volume2 className="size-4 text-amber-900" /> Voice Recording
              {audioCount > 1 && (
                <span className="text-amber-900/60">
                  · +{audioCount - 1} more
                </span>
              )}
            </span>
            {durationSec !== null && (
              <span className="rounded-md bg-amber-900/10 px-2 py-0.5 text-amber-900">
                {formatTime(durationSec)}
              </span>
            )}
          </div>
          <audio
            controls
            preload="metadata"
            src={firstAudio.playback_url}
            className="h-10 w-full"
          />
        </div>
      )}

      {memory.body_text && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-amber-900/85">
          {memory.body_text}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-amber-900/15 pt-3 text-xs text-amber-900/70">
        <span>{currentUserId === "owner" ? "By You" : "By Contributor"}</span>
        <span>{dateStr}</span>
      </div>
    </article>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}