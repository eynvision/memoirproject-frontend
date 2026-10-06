"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Wand2, Edit2, LayoutGrid, ListTree, Check, X } from "lucide-react";
import { MemoryItem } from "../types";
import { MemoryCard } from "./MemoryCard";

interface MemoryArchiveProps {
  expandedStacks: string[];
  toggleStack: (kind: string) => void;
  mockMemories: (MemoryItem & { 
    audioUrl?: string; 
    mediaUrl?: string; 
    transcription?: string; 
    chapter_id?: string; 
    content?: string;
    body_text?: string;
    ai_woven_text?: string;
    title?: string;
  })[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chapters?: any[]; 
  memoirId: string; // Added memoirId to support inline saving
  isGenerating?: boolean;
  onGenerateTimeline?: () => void;
  onRenameChapter?: (chapterId: string, newTitle: string) => void;
  onUpdateWovenText?: (memoryId: string, newText: string) => void;
}

export function MemoryArchive({ 
  expandedStacks, 
  toggleStack, 
  mockMemories,
  chapters = [],
  isGenerating = false,
  onGenerateTimeline,
  onRenameChapter,
  onUpdateWovenText
}: MemoryArchiveProps) {
  
  const [viewMode, setViewMode] = useState<"material" | "timeline">("material");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Inline Memory Text Editing States
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editWovenText, setEditWovenText] = useState("");

  const handleSaveChapterTitle = (chapterId: string) => {
    if (editTitle.trim() && onRenameChapter) {
      onRenameChapter(chapterId, editTitle.trim());
    }
    setEditingChapterId(null);
  };

  const handleSaveWovenText = (memoryId: string) => {
    if (onUpdateWovenText) {
      onUpdateWovenText(memoryId, editWovenText);
    }
    setEditingMemoryId(null);
  };

  return (
    <>
      <div className="w-full flex items-center justify-center my-12 opacity-80">
        <div className="h-0.5 bg-stone-400 w-32"></div>
        <div className="mx-4 w-2 h-2 rounded-full bg-stone-500"></div>
        <div className="h-0.5 bg-stone-400 w-32"></div>
      </div>

      <section id="archive" className="relative z-10 pt-4">
        <div className="flex flex-col">
          
          <div className="text-center mb-8">
            <h3 className="font-sans font-bold text-3xl text-stone-900 mb-2">The Memory Archive</h3>
            <div className="w-16 h-1 bg-memory-primary rounded-full mx-auto mt-4"></div>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex justify-center mb-16">
            <div className="bg-stone-200/50 p-1 rounded-lg flex items-center gap-1 border border-stone-300 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("material")}
                className={`flex items-center gap-2 px-5 py-2 rounded-md font-sans text-sm font-semibold transition-all cursor-pointer ${
                  viewMode === "material" 
                    ? "bg-white text-stone-900 shadow-sm border border-stone-200" 
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <LayoutGrid size={16} /> Group by Material
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-2 px-5 py-2 rounded-md font-sans text-sm font-semibold transition-all cursor-pointer ${
                  viewMode === "timeline" 
                    ? "bg-white text-stone-900 shadow-sm border border-stone-200" 
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <ListTree size={16} /> Assemble Timeline
              </button>
            </div>
          </div>

          {/* MATERIAL VIEW */}
          {viewMode === "material" && (
            <div className="space-y-20">
              {[
                { id: 'text', title: "Written Reflections", items: mockMemories.filter(m => m.kind === 'text') },
                { id: 'photo', title: "Photographic Plates", items: mockMemories.filter(m => m.kind === 'photo' || m.kind === 'combined') },
                { id: 'audio', title: "Voice Notes", items: mockMemories.filter(m => m.kind === 'audio') }
              ].map(group => {
                if (group.items.length === 0) return null;
                const isExpanded = expandedStacks.includes(group.id);

                return (
                  <div key={group.id} className="flex flex-col">
                    <div className="flex items-center gap-4 mb-8 border-b border-stone-300 pb-3">
                      <h4 className="font-sans font-semibold text-2xl text-stone-800">{group.title}</h4>
                    </div>
                    <div className="relative w-full mx-auto flex flex-col">
                      <AnimatePresence>
                        {group.items.map((memory, index) => {
                          if (!isExpanded && index > 2) return null;
                          const isStacked = !isExpanded && index > 0;
                          return (
                            <motion.div 
                              key={memory.id} 
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ 
                                opacity: 1,
                                scale: isStacked ? 1 - (index * 0.03) : 1,
                                rotate: isExpanded ? 0 : (index === 1 ? -1 : index === 2 ? 1 : 0),
                                marginTop: isExpanded ? (index > 0 ? "32px" : "0px") : (index > 0 ? "-120px" : "0px")
                              }}
                              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                              className={`w-full ${isStacked ? 'pointer-events-none' : ''}`}
                              style={{ zIndex: 40 - index }}
                            >
                              <div className={isStacked ? "opacity-50 saturate-50 bg-memory-bg border-stone-300/50 rounded-xl transition-all" : ""}>
                                <MemoryCard 
                                  memory={memory} 
                                  availableChapters={chapters}
                                  onPlayAudio={(id) => console.log("Play audio", id)}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                    {group.items.length > 1 && (
                      <div className="mt-12 flex justify-center z-50">
                        <motion.button
                          type="button"
                          onClick={() => toggleStack(group.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="cursor-pointer bg-white border-2 border-stone-300 text-stone-800 px-8 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 shadow-md flex items-center gap-3 group hover:border-memory-primary hover:text-memory-primary"
                        >
                          <Layers size={18} className={`text-stone-400 group-hover:text-memory-primary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          {isExpanded ? `Close ${group.title} Stack` : `Unpack All ${group.items.length} Pieces`}
                        </motion.button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TIMELINE BOOK VIEW WITH INLINE EDITING */}
          {viewMode === "timeline" && (
            <div className="flex flex-col w-full max-w-2xl mx-auto px-4 font-serif text-stone-800">
              {chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-[#FAF7F2] border border-stone-300 border-dashed rounded-2xl font-sans">
                  <Wand2 size={32} className="text-memory-primary mb-4 opacity-80" />
                  <h4 className="text-xl font-bold text-stone-900 mb-2">Unstructured Archive</h4>
                  <p className="text-sm text-stone-600 max-w-sm mb-8">
                    Allow the system to organize your memories into chronological book chapters.
                  </p>
                  <motion.button
                    onClick={onGenerateTimeline}
                    disabled={isGenerating}
                    whileHover={!isGenerating ? { scale: 1.02 } : {}}
                    whileTap={!isGenerating ? { scale: 0.98 } : {}}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-md ${
                      isGenerating ? 'bg-stone-400 cursor-not-allowed' : 'bg-memory-primary hover:bg-[#5a222a] cursor-pointer'
                    }`}
                  >
                    <Wand2 size={16} className={isGenerating ? "animate-pulse" : ""} />
                    {isGenerating ? "Assembling Chapters..." : "Organize Timeline"}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-16">
                  {chapters.map((chapter) => {
                    const chapterMemories = mockMemories.filter(m => 
                      m.chapter_id && chapter.id && String(m.chapter_id).trim() === String(chapter.id).trim()
                    );

                    return (
                      <article key={chapter.id} className="flex flex-col space-y-6">
                        
                        {/* CHAPTER HEADING */}
                        <div className="border-b border-stone-300 pb-4 group">
                          <div className="flex items-center justify-between">
                            {editingChapterId === chapter.id ? (
                              <div className="flex items-center gap-2 font-sans w-full">
                                <input 
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="font-sans font-bold text-3xl text-stone-900 bg-transparent border-b border-memory-primary outline-none px-1 w-full"
                                  autoFocus
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveChapterTitle(chapter.id)}
                                />
                                <button onClick={() => handleSaveChapterTitle(chapter.id)} className="text-xs font-semibold text-memory-primary hover:underline cursor-pointer">Save</button>
                              </div>
                            ) : (
                              <>
                                <h2 className="font-sans font-bold text-3xl md:text-4xl text-stone-900 tracking-tight">
                                  {chapter.title}
                                </h2>
                                <button 
                                  onClick={() => { setEditingChapterId(chapter.id); setEditTitle(chapter.title); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-stone-400 hover:text-memory-primary cursor-pointer font-sans"
                                  title="Edit Chapter Title"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* MEMORY STREAM WITH HOVER INLINE EDITING */}
                        <div className="space-y-8">
                          {chapterMemories.length === 0 ? (
                            <p className="text-stone-400 text-sm italic font-sans py-4 text-center border border-stone-200 border-dashed rounded-lg">
                              No memories recorded in this chapter yet.
                            </p>
                          ) : (
                            chapterMemories.map((memory, mIdx) => {
                              const isEven = mIdx % 2 === 0;
                              const isEditing = editingMemoryId === memory.id;
                              const storyText = memory.ai_woven_text || memory.body_text || memory.content || memory.transcription || "";

                              return (
                                <div key={memory.id} className="clearfix relative group leading-[1.9] text-[17.5px] text-stone-800">
                                  
                                  {/* Inline Photograph */}
                                  {memory.mediaUrl && (
                                    <figure className={`float-${isEven ? 'left mr-5' : 'right ml-5'} mt-1 mb-2 p-1.5 bg-white shadow-md border border-stone-200 rounded-sm transform ${isEven ? '-rotate-1' : 'rotate-1'} w-48 shrink-0`}>
                                      <div className="relative w-full aspect-4/3 bg-stone-100 overflow-hidden">
                                        <Image 
                                          src={memory.mediaUrl} 
                                          alt={memory.title || "Archival Photo"} 
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                    </figure>
                                  )}

                                  {/* INLINE EDITABLE NARRATIVE PARAGRAPH */}
                                  {isEditing ? (
                                    <div className="flex flex-col gap-3 font-sans bg-white p-4 border border-memory-primary rounded-xl shadow-md clear-both">
                                      <textarea 
                                        value={editWovenText}
                                        onChange={(e) => setEditWovenText(e.target.value)}
                                        rows={5}
                                        className="w-full p-3 font-serif text-[16px] text-stone-900 border border-stone-300 rounded-lg outline-none focus:border-memory-primary resize-y"
                                        autoFocus
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => setEditingMemoryId(null)}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md cursor-pointer transition-all"
                                        >
                                          <X size={14} /> Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleSaveWovenText(memory.id)}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-memory-primary hover:bg-[#5a222a] rounded-md cursor-pointer transition-all"
                                        >
                                          <Check size={14} /> Save Changes
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative group/text">
                                      <p className={`whitespace-pre-wrap book-text ${
                                        mIdx === 0 && !memory.mediaUrl ? "first-letter:text-4xl first-letter:font-bold first-letter:mr-2.5 first-letter:float-left" : ""
                                      }`}>
                                        {storyText}
                                      </p>
                                      
                                      {/* Subtle Hover Edit Button for the Story Paragraph */}
                                      <button
                                        onClick={() => { setEditingMemoryId(memory.id); setEditWovenText(storyText); }}
                                        className="absolute -right-6 top-0 opacity-0 group-hover/text:opacity-100 transition-opacity p-1.5 text-stone-400 hover:text-memory-primary cursor-pointer font-sans"
                                        title="Edit Narrative Paragraph"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                    </div>
                                  )}

                                  {/* Audio Note */}
                                  {memory.audioUrl && (
                                    <div className="mt-2 inline-flex items-center gap-2.5 bg-[#FAF7F2] border border-stone-200 py-1 px-2.5 rounded-xl shadow-sm font-sans clear-both">
                                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Voice Note</span>
                                      <audio controls src={memory.audioUrl} className="w-40 h-5 outline-none" controlsList="nodownload" />
                                    </div>
                                  )}

                                </div>
                              );
                            })
                          )}
                        </div>

                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}