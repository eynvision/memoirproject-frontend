"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// Removed Edit2 and Trash2 since we are deleting those buttons
import { Play, MoreHorizontal, FolderOutput } from "lucide-react";
import { MemoryItem } from "../types";

interface MemoryCardProps {
  memory: MemoryItem & { 
    audioUrl?: string; 
    chapter_id?: string;
    mediaUrl?: string;
    transcription?: string;
    duration?: string;
    content?: string;
    title?: string;
    date?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableChapters?: any[];
  onOptionSelect?: (action: string, memoryId: string, targetChapterId?: string) => void;
  onPlayAudio?: (memoryId: string) => void;
}

export function MemoryCard({ memory, onOptionSelect, onPlayAudio, availableChapters }: MemoryCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getContainerStyles = (kind: string) => {
    const base = "relative z-10 p-6 md:p-8 transition-all duration-300 shadow-[0_4px_16px_rgba(122,46,57,0.02)] hover:shadow-[0_8px_24px_rgba(122,46,57,0.06)] ";
    
    switch (kind) {
      case "text":
        return base + "bg-[#FAF7F2] border border-[#7a2e39]/15 rounded-2xl";
      case "photo":
        return base + "bg-white border-2 border-dashed border-[#7a2e39]/25 rounded-xl";
      case "audio":
        return base + "bg-[#FDFBF9] border border-[#7a2e39]/10 rounded-[2rem]";
      case "combined":
        return base + "bg-white border-4 border-double border-[#7a2e39]/30 rounded-2xl";
      default:
        return base + "bg-[#FAF7F2] border border-stone-200 rounded-2xl";
    }
  };

  const getRadiusClass = (kind: string) => {
    if (kind === "audio") return "rounded-[2rem]";
    if (kind === "photo") return "rounded-xl";
    return "rounded-2xl";
  };

  return (
    <div className="relative group w-full">
      
      {memory.kind === "text" && (
        <div className="absolute -inset-1.5 border-2 border-dashed border-[#3a0f18]/60 rounded-2xl transform rotate-1 transition-all duration-300 group-hover:rotate-2 group-hover:border-[#3a0f18]/80 z-0 pointer-events-none"></div>
      )}
      
      {memory.kind === "photo" && (
        <div className="absolute inset-0 bg-[#3a0f18]/90 rounded-xl transform translate-x-2.5 translate-y-2.5 transition-all duration-300 group-hover:translate-x-3.5 group-hover:translate-y-3.5 shadow-sm z-0 pointer-events-none"></div>
      )}
      
      {memory.kind === "combined" && (
        <div className="absolute -inset-y-1.5 -left-2.5 right-0 border-l-8 border-[#3a0f18]/90 bg-[#3a0f18]/5 rounded-2xl transform transition-all duration-300 group-hover:-left-3.5 group-hover:border-[#3a0f18] z-0 pointer-events-none"></div>
      )}
      
      {memory.kind === "audio" && (
        <>
          <div className="absolute -inset-2.5 border-[1.5px] border-[#3a0f18]/40 rounded-[2.3rem] transform transition-all duration-300 group-hover:scale-[1.02] group-hover:border-[#3a0f18]/60 z-0 pointer-events-none"></div>
          <div className="absolute -inset-0.5 border border-[#3a0f18]/20 rounded-4xl z-0 pointer-events-none"></div>
        </>
      )}

      <article className={getContainerStyles(memory.kind)}>
        <div 
          className={`absolute inset-0 opacity-[0.035] pointer-events-none ${getRadiusClass(memory.kind)}`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative flex items-start justify-between mb-6 z-10">
          <div className="flex items-center">
            <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#7a2e39]/70 font-bold">
              {memory.date}
            </span>
          </div>

          {/* NEW LOGIC: Only render the 3-dots menu if there are chapters available to move the memory into */}
          {availableChapters && availableChapters.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="w-8 h-8 flex items-center justify-center text-[#7a2e39]/40 hover:text-[#7a2e39] transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100"
              >
                <MoreHorizontal size={18} />
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div 
                    key="card-options"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-44 bg-[#FAF7F2] border border-[#7a2e39]/20 rounded-xl shadow-xl py-2 z-20"
                  >
                    <div className="px-4 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Move to Chapter
                    </div>
                    {availableChapters.map(chapter => (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => { setShowOptions(false); onOptionSelect?.("move", memory.id, chapter.id); }}
                        className={`w-full text-left px-4 py-2 text-[12px] font-sans font-medium hover:bg-[#EFECE6] transition-colors flex items-center gap-2 cursor-pointer ${memory.chapter_id === chapter.id ? 'text-memory-primary bg-stone-100/50' : 'text-stone-600'}`}
                      >
                        <FolderOutput size={12} className="shrink-0" /> 
                        <span className="truncate">{chapter.title}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CONTENT BLOCKS (Unchanged) */}
        <div className="relative z-10">
          
          {memory.kind === "text" && (
            <div>
              {memory.title && <h4 className="font-sans font-bold text-xl text-stone-900 mb-3 leading-tight">{memory.title}</h4>}
              {memory.content && (
                <p className="font-sans text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap book-text mb-4">
                  {memory.content}
                </p>
              )}
            </div>
          )}

          {memory.kind === "combined" && (
            <div className="flex flex-col-reverse sm:flex-row gap-8 items-start justify-between">
              <div className="flex-1 w-full flex flex-col space-y-5">
                <div>
                  {memory.title && <h4 className="font-sans font-bold text-xl text-stone-900 leading-tight mb-2">{memory.title}</h4>}
                  
                  {memory.content && (
                    <p className="font-sans text-[15px] text-stone-700 leading-relaxed whitespace-pre-wrap book-text">
                      {memory.content}
                    </p>
                  )}
                </div>

                {memory.audioUrl && (
                  <div className="bg-white border border-stone-200 py-1.5 px-3 rounded-3xl shadow-sm w-full max-w-70">
                    <audio 
                      controls 
                      src={memory.audioUrl} 
                      className="w-full h-9 outline-none" 
                      controlsList="nodownload"
                    />
                  </div>
                )}

                {memory.transcription && (
                  <div className="pt-2">
                    <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 mb-2 font-bold">Voice Transcription</p>
                    <p className="font-sans text-[15.5px] text-stone-900 leading-[1.7] pl-4 border-l-[3px] border-stone-300 bg-stone-100/30 py-2.5 pr-4 rounded-r-lg">
                      &quot;{memory.transcription}&quot;
                    </p>
                  </div>
                )}
              </div>

              {memory.mediaUrl && (
                <figure className="p-2.5 bg-white shadow-md border border-stone-200 rounded-sm transform rotate-2 shrink-0 sm:ml-4">
                  <div className="relative w-full sm:w-55 aspect-4/3 bg-stone-100 overflow-hidden border border-stone-200/50 rounded-sm">
                    <Image 
                      src={memory.mediaUrl} 
                      alt={memory.title || "Memory Photo"} 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </figure>
              )}
            </div>
          )}

          {memory.kind === "photo" && (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {memory.mediaUrl && (
                <figure className="p-2.5 bg-white shadow-md border border-stone-200 rounded-sm transform -rotate-1 shrink-0">
                  <div className="relative w-55 aspect-4/3 bg-stone-100 overflow-hidden border border-stone-200/50 rounded-sm">
                    <Image 
                      src={memory.mediaUrl} 
                      alt={memory.title || "Memory Photo"} 
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </figure>
              )}
              <div className="flex-1">
                {memory.title && <h4 className="font-sans font-bold text-xl text-stone-900 mb-2 leading-tight">{memory.title}</h4>}
                <p className="font-sans text-[15px] text-stone-700 leading-relaxed book-text">{memory.content}</p>
              </div>
            </div>
          )}

          {memory.kind === "audio" && (
            <div className="space-y-4">
              {memory.title && <h4 className="font-sans font-bold text-xl text-stone-900 mb-1">{memory.title}</h4>}
              
              {memory.content && <p className="font-sans text-[15px] text-stone-700 leading-relaxed book-text">{memory.content}</p>}
              
              {memory.audioUrl ? (
                <div className="bg-white border border-stone-200 py-1.5 px-3 rounded-3xl shadow-sm w-full max-w-70">
                  <audio 
                    controls 
                    src={memory.audioUrl} 
                    className="w-full h-9 outline-none" 
                    controlsList="nodownload"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-[#FAF7F2] border border-stone-300 p-3 rounded-2xl shadow-sm max-w-70">
                  <button
                    type="button"
                    onClick={() => onPlayAudio?.(memory.id)}
                    className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center hover:bg-[#7a2e39] hover:text-white text-stone-700 transition-colors shadow-sm border border-stone-300 shrink-0 cursor-pointer"
                  >
                    <Play size={16} className="ml-0.5" />
                  </button>
                  <div className="flex flex-col">
                    <span className="font-sans text-[14px] font-medium text-stone-800">Voice Note</span>
                    {memory.duration && <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-semibold mt-0.5">{memory.duration}</span>}
                  </div>
                </div>
              )}

              {memory.transcription && (
                <div className="mt-5 pt-4 border-t border-stone-300/60 border-dashed">
                  <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 mb-2.5 font-bold">Transcription</p>
                  <p className="font-sans text-[15.5px] text-stone-900 leading-[1.7] pl-4 border-l-[3px] border-stone-300 bg-stone-100/30 py-2.5 pr-4 rounded-r-lg">
                    &quot;{memory.transcription}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}