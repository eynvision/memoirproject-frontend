"use client";

import { useRef } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";

interface PhotoUploadInputProps {
  activeInput: "media" | "combined" | string;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
}

export function PhotoUploadInput({
  activeInput,
  photoFile,
  setPhotoFile,
}: PhotoUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeInput !== "media" && activeInput !== "combined") return null;

  return (
    <div className="space-y-2 bg-white pt-2" onClick={(e) => e.stopPropagation()}>
      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setPhotoFile(e.target.files[0]);
          }
        }}
      />

      {!photoFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/50 flex items-center justify-center p-6 gap-3 cursor-pointer hover:bg-stone-100 transition-colors"
        >
          <Camera size={20} className="text-stone-500" />
          <span className="text-[14px] font-sans font-semibold text-stone-600">Attach photo plate</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-300 rounded-xl">
          <div className="flex items-center gap-3 truncate">
            <ImageIcon size={20} className="text-memory-primary shrink-0" />
            <span className="text-[14px] font-medium text-stone-700 truncate">{photoFile.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoFile(null)}
            className="text-stone-400 hover:text-red-500 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}