"use client";

import { useRef } from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ALLOWED_PHOTO_MIME,
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTOS_PER_MEMORY,
} from "@/features/memory/schemas";

export type PickedImage = {
  file: File;
  caption: string;
  previewUrl: string;
};

export function ImagePicker({
  images,
  onChange,
}: {
  images: PickedImage[];
  onChange: (imgs: PickedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS_PER_MEMORY - images.length;
    const next: PickedImage[] = [];

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!ALLOWED_PHOTO_MIME.includes(file.type as (typeof ALLOWED_PHOTO_MIME)[number])) {
        alert(`${file.name}: only JPEG, PNG, or WebP files are allowed.`);
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        alert(`${file.name}: is larger than 10 MB.`);
        continue;
      }
      next.push({
        file,
        caption: "",
        previewUrl: URL.createObjectURL(file),
      });
    }

    onChange([...images, ...next]);
  }

  function updateCaption(idx: number, caption: string) {
    const copy = [...images];
    copy[idx] = { ...copy[idx], caption };
    onChange(copy);
  }

  function remove(idx: number) {
    URL.revokeObjectURL(images[idx].previewUrl);
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-paper-400 py-8 text-center transition-colors hover:bg-paper-100">
        <UploadCloud className="size-8 text-ink-400" strokeWidth={1.5} />
        <span className="text-[15px] font-medium text-ink-700">
          Upload a photograph
        </span>
        <span className="text-[13px] text-ink-400">
          JPEG, PNG, or WebP · Up to {MAX_PHOTOS_PER_MEMORY} photos
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_PHOTO_MIME.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((img, i) => (
            <div key={i} className="space-y-2">
              {/* White print matte around every thumbnail */}
              <div className="rounded-md bg-white p-1 shadow-e1 ring-1 ring-paper-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt=""
                  className="h-20 w-full rounded-sm object-cover"
                />
              </div>
              <input
                type="text"
                value={img.caption}
                onChange={(e) => updateCaption(i, e.target.value)}
                placeholder="Optional caption"
                className="w-full rounded-lg border border-paper-400 bg-paper-000 px-2 py-1.5 text-xs text-ink-700 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(i)}
                className="text-ink-500 hover:bg-clay-100 hover:text-clay-500"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}