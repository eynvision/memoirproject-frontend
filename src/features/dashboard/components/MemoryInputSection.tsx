"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Mic, Camera, FileText, X, Image as ImageIcon } from "lucide-react";
import { WrittenReflectionInput } from "./WrittenReflectionInput";
import { AudioRecorderInput } from "./AudioRecorderInput";
import { PhotoUploadInput } from "./PhotoUploadInput";

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

  return (
    <section id="overview" className="relative z-50 mb-16">
      <div className="relative">
        
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

              {/* 3. PHOTOGRAPH */}
              <motion.button
                type="button"
                onClick={() => setActiveInput("media")}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#FAFAFA] border-2 border-memory-primary p-3 pb-8 rounded-[3px] shadow-md flex flex-col justify-start h-40 text-left group relative overflow-hidden transform -rotate-2 cursor-pointer"
              >
                <div className="w-full flex-1 bg-stone-200 border border-stone-300 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-tr from-white/40 via-transparent to-black/5 pointer-events-none"></div>
                  <ImageIcon size={22} className="text-stone-400 group-hover:text-memory-primary transition-colors relative z-10" />
                </div>
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

                        {/* Delegated Sub-Components */}
                        <WrittenReflectionInput
                          activeInput={activeInput}
                          isTextExpanded={isTextExpanded}
                          setIsTextExpanded={setIsTextExpanded}
                          inputContent={inputContent}
                          setInputContent={setInputContent}
                        />

                        <AudioRecorderInput
                          activeInput={activeInput}
                          recording={recording}
                          audioUrl={audioUrl}
                          startRecording={startRecording}
                          stopRecording={stopRecording}
                          clearRecording={clearRecording}
                        />

                        <PhotoUploadInput
                          activeInput={activeInput}
                          photoFile={photoFile}
                          setPhotoFile={setPhotoFile}
                        />

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