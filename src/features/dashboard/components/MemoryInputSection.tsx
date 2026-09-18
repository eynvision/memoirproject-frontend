"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Mic, Camera, FileText, X, Image as ImageIcon, Square } from "lucide-react";

interface MemoryInputSectionProps {
  activeInput: "none" | "text" | "audio" | "media" | "combined";
  setActiveInput: (val: "none" | "text" | "audio" | "media" | "combined") => void;
  isTextExpanded: boolean;
  setIsTextExpanded: (val: boolean) => void;
  isAssembling: boolean;
  inputTitle: string;
  setInputTitle: (val: string) => void;
  inputDate: string;
  setInputDate: (val: string) => void;
  inputContent: string;
  setInputContent: (val: string) => void;
  handleLocalSubmit: (e: React.FormEvent) => void;
  
  // Media controls wired from useCaptureMemory
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  recording: boolean;
  audioUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
}

export function MemoryInputSection(props: MemoryInputSectionProps) {
  const {
    activeInput, setActiveInput, isTextExpanded, setIsTextExpanded, isAssembling,
    inputTitle, setInputTitle, inputDate, setInputDate, inputContent, setInputContent, handleLocalSubmit,
    photoFile, setPhotoFile, recording, audioUrl, startRecording, stopRecording, clearRecording
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section id="overview" className="relative z-50 mb-16">
      <div className="relative">
        
        {/* Hidden native input for photo upload */}
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

        {activeInput === "none" && (
          <div className="flex flex-col items-center justify-center py-10 space-y-8">
            <div className="text-center space-y-2">
              <p className="font-sans text-2xl font-medium text-stone-800 tracking-wide">How would you like to hold onto today?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-4 w-full max-w-xl">
              
              {/* 1. WRITTEN REFLECTION */}
              <motion.button
                type="button"
                onClick={() => setActiveInput("text")}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border-2 border-dashed border-memory-primary p-6 shadow-sm flex flex-col justify-between h-40 text-left group relative overflow-hidden cursor-pointer"
                style={{ borderRadius: "4px 16px 16px 4px" }}
              >
                <div className="absolute top-0 right-0 w-8 h-8 bg-stone-100 border-b border-l border-memory-primary transform rotate-45 translate-x-4 -translate-y-4"></div>
                <div className="flex items-center gap-3 text-memory-primary">
                  <PenLine size={18} />
                  <span className="font-sans font-semibold text-[16px] text-stone-800">Written Reflection</span>
                </div>
                <div className="space-y-2 opacity-30 py-1">
                  <div className="w-full h-px bg-stone-400"></div>
                  <div className="w-4/5 h-px bg-stone-400"></div>
                </div>
                <span className="text-[12px] font-sans font-medium text-stone-500 group-hover:text-memory-primary transition-colors">Write page &rarr;</span>
              </motion.button>

              {/* 2. VOICE NOTE */}
              <motion.button
                type="button"
                onClick={() => setActiveInput("audio")}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border-2 border-memory-primary p-6 rounded-full shadow-sm flex flex-col justify-between h-40 text-left group relative overflow-hidden px-10 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-memory-primary pt-1">
                  <Mic size={18} />
                  <span className="font-sans font-semibold text-[16px] text-stone-800">Voice Note</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2 h-4 bg-memory-primary/40 rounded-full"></div>
                  <div className="w-2 h-6 bg-memory-primary/70 rounded-full"></div>
                  <div className="w-2 h-5 bg-memory-primary/50 rounded-full"></div>
                  <div className="w-2 h-9 bg-memory-primary rounded-full"></div>
                </div>
                <span className="text-[12px] font-sans font-medium text-stone-500 group-hover:text-memory-primary transition-colors pb-1 text-center">Record audio &rarr;</span>
              </motion.button>

              {/* 3. PHOTOGRAPH (Creative Polaroid Aesthetic) */}
              <motion.button
                type="button"
                onClick={() => setActiveInput("media")}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                whileTap={{ scale: 0.98 }}
                // Classic Polaroid Shape: Tight padding on top/sides (p-3), thick padding on bottom (pb-8)
                className="bg-[#FAFAFA] border-2 border-memory-primary p-3 pb-8 rounded-[3px] shadow-md flex flex-col justify-start h-40 text-left group relative overflow-hidden transform -rotate-2 cursor-pointer"
              >
                {/* The "Film" Area */}
                <div className="w-full flex-1 bg-stone-200 border border-stone-300 shadow-inner flex items-center justify-center relative overflow-hidden">
                  {/* Subtle glossy glare effect over the dark film area */}
                  <div className="absolute inset-0 bg-linear-to-tr from-white/40 via-transparent to-black/5 pointer-events-none"></div>
                  <ImageIcon size={22} className="text-stone-400 group-hover:text-memory-primary transition-colors relative z-10" />
                </div>
                
                {/* The Labels on the thick bottom lip of the Polaroid */}
                <div className="mt-3 flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-2 text-memory-primary">
                    <Camera size={14} />
                    <span className="font-sans font-semibold text-[15px] text-stone-800 leading-none mt-0.5">Photograph</span>
                  </div>
                  <span className="text-[11px] font-sans font-medium text-stone-500 group-hover:text-memory-primary transition-colors mt-0.5">Attach plate &rarr;</span>
                </div>
              </motion.button>

              {/* 4. COMBINED MEMORY */}
              <motion.button
                type="button"
                onClick={() => setActiveInput("combined")}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border-4 border-double border-memory-primary p-6 rounded-sm shadow-sm flex flex-col justify-between h-40 text-left group relative overflow-hidden transform rotate-1 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-memory-primary">
                  <FileText size={18} />
                  <span className="font-sans font-semibold text-[16px] text-stone-800">Combined Archive</span>
                </div>
                <p className="font-sans text-[13px] text-stone-600 leading-tight">
                  Blend voice notes, photos & reflections into one piece.
                </p>
                <span className="text-[12px] font-sans font-medium text-stone-500 group-hover:text-memory-primary transition-colors">Open hybrid canvas &rarr;</span>
              </motion.button>

            </div>
          </div>
        )}

        <AnimatePresence>
          {activeInput !== "none" && (
            <motion.div 
              key="puzzle-form"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative space-y-6">
                
                <div className="flex items-center justify-end px-2 mb-1">
                  <motion.button 
                    type="button" 
                    onClick={() => {
                      setActiveInput("none");
                      setIsTextExpanded(false);
                    }} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-stone-500 hover:text-stone-900 cursor-pointer p-2.5 bg-white rounded-xl shadow-sm border border-stone-200 transition-all duration-300"
                    title="Close"
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                <form onSubmit={handleLocalSubmit} className="space-y-6">
                  
                  <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* HEADING PIECE */}
                    <div 
                      className="p-8 bg-white border-2 border-memory-primary shadow-md relative flex flex-col justify-between"
                      style={{ borderRadius: "28px 18px 22px 32px" }}
                    >
                      <div className="space-y-3">
                        <label className="block text-[12px] font-sans font-bold text-memory-primary uppercase tracking-wide">Heading Piece</label>
                        <input
                          type="text"
                          required
                          value={inputTitle}
                          onChange={(e) => setInputTitle(e.target.value)}
                          placeholder="Give this memory a title..."
                          autoFocus
                          className="w-full bg-white font-sans text-2xl font-bold text-stone-900 border-b border-stone-300 pb-2 outline-none focus:border-memory-primary placeholder:text-stone-400 placeholder:font-medium"
                        />
                      </div>
                    </div>

                    {/* DATE PIECE */}
                    <div 
                      className="p-8 bg-white border-2 border-memory-primary shadow-md relative flex flex-col justify-between"
                      style={{ borderRadius: "18px 32px 28px 16px" }}
                    >
                      <div className="space-y-3">
                        <label className="block text-[12px] font-sans font-bold text-memory-primary uppercase tracking-wide">Date Piece</label>
                        <input
                          type="date"
                          value={inputDate}
                          onChange={(e) => setInputDate(e.target.value)}
                          className="bg-white text-[16px] font-sans font-medium text-stone-700 border-b border-stone-300 pb-2 outline-none focus:border-memory-primary cursor-pointer w-full mt-2"
                        />
                      </div>
                    </div>

                    {/* CONTENT PIECE */}
                    <div 
                      onClick={() => setIsTextExpanded(true)}
                      className={`p-8 bg-white border-2 border-memory-primary shadow-md relative transition-all duration-300 ${isTextExpanded ? 'ring-2 ring-memory-primary/20 md:col-span-3' : 'cursor-pointer hover:border-memory-primary flex flex-col justify-between'}`}
                      style={{ borderRadius: "22px 20px 32px 18px" }}
                    >
                      <div className="space-y-3 w-full">
                        <label className="block text-[12px] font-sans font-bold text-memory-primary uppercase tracking-wide">
                          Content Piece {isTextExpanded ? "(Expanded)" : "(Click to write)"}
                        </label>

                        {(activeInput === "text" || activeInput === "combined") && (
                          <div>
                            {isTextExpanded ? (
                              <textarea
                                value={inputContent}
                                onChange={(e) => setInputContent(e.target.value)}
                                placeholder={activeInput === "combined" ? "Add reflection text..." : "Write your story here with care..."}
                                rows={6}
                                autoFocus
                                className="w-full bg-stone-50/50 text-stone-800 font-sans text-[16px] leading-relaxed placeholder:text-stone-400 border border-stone-300 p-5 rounded-xl outline-none focus:border-memory-primary resize-none book-text mt-2"
                              />
                            ) : (
                              <div className="py-2 text-stone-400 font-sans text-[16px] font-medium select-none truncate">
                                {inputContent ? inputContent : "Click here to expand and write freely..."}
                              </div>
                            )}
                          </div>
                        )}

                        {/* VOICE RECORDING SECTION */}
                        {(activeInput === "audio" || activeInput === "combined") && (
                          <div className="flex flex-col gap-3 py-2 bg-white" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-4">
                              <button 
                                type="button" 
                                onClick={recording ? stopRecording : startRecording}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-all ${
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

                            {/* Recorded Audio Preview */}
                            {audioUrl && (
                              <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200 w-fit mt-1">
                                <audio src={audioUrl} controls className="h-8 max-w-60" />
                                <button
                                  type="button"
                                  onClick={clearRecording}
                                  className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                                  title="Delete recording"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PHOTOGRAPH UPLOAD SECTION */}
                        {(activeInput === "media" || activeInput === "combined") && (
                          <div className="space-y-2 bg-white pt-2" onClick={(e) => e.stopPropagation()}>
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
                                  className="text-stone-400 hover:text-red-500 p-1"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </motion.div>

                  {/* Submission CTA */}
                  <div className="flex justify-end pt-4">
                    <motion.button
                      type="submit"
                      disabled={isAssembling}
                      whileHover={!isAssembling ? { scale: 1.01 } : {}}
                      whileTap={!isAssembling ? { scale: 0.99 } : {}}
                      className={`px-10 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-3 ${
                        !isAssembling
                          ? "bg-memory-primary text-memory-light hover:bg-memory-primary/90 shadow-black/10"
                          : "bg-stone-200 border-stone-300 text-stone-500 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {isAssembling ? "Preserving..." : "Preserve Memory"}
                    </motion.button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}