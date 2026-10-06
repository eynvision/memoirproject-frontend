"use client";

import React from "react";
import { Mic, Square, X } from "lucide-react";

interface AudioRecorderInputProps {
  activeInput: "audio" | "combined" | string;
  recording: boolean;
  audioUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
}

export function AudioRecorderInput({
  activeInput,
  recording,
  audioUrl,
  startRecording,
  stopRecording,
  clearRecording,
}: AudioRecorderInputProps) {
  if (activeInput !== "audio" && activeInput !== "combined") return null;

  return (
    <div className="flex flex-col gap-3 py-2 bg-white" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          onClick={recording ? stopRecording : startRecording}
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-all cursor-pointer ${
            recording 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-memory-primary text-memory-light hover:bg-memory-primary/90"
          }`}
        >
          {recording ? <Square size={18} /> : <Mic size={18} />}
        </button>
        
        <span className="font-sans text-[15px] font-medium text-stone-600">
          {recording 
            ? "Recording... click to stop" 
            : audioUrl 
            ? "Voice note captured" 
            : activeInput === "combined" 
            ? "Record voice note" 
            : "Tap to record voice note"}
        </span>
      </div>

      {audioUrl && (
        <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200 w-fit mt-1">
          <audio src={audioUrl} controls className="h-8 max-w-60" />
          <button
            type="button"
            onClick={clearRecording}
            className="text-stone-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
            title="Delete recording"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}