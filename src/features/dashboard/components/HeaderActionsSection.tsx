"use client";

import { motion } from "framer-motion";
import { Lock, Copy, Check, FileDown } from "lucide-react";

interface HeaderActionsSectionProps {
  handleCopyLink: () => void;
  isLinkCopied: boolean;
  pdfFileName: string;
  setPdfFileName: (val: string) => void;
  triggerExport: (name: string) => void;
  isExporting: boolean;
  onPublish: () => void; 
}

export function HeaderActionsSection({
  handleCopyLink,
  isLinkCopied,
  pdfFileName,
  setPdfFileName,
  triggerExport,
  isExporting,
  onPublish, // Added to props
}: HeaderActionsSectionProps) {
  return (
    <div className="flex items-center gap-4">
      {/* COMPACT PDF Export Tool */}
      <div className="flex items-center gap-2 bg-white h-11 px-2 border border-stone-500 shadow-sm rounded-sm transition-all z-10">
        <FileDown size={14} className="text-stone-500 ml-1" />
        <div className="h-4 w-px bg-stone-300"></div>
        <input
          type="text"
          value={pdfFileName}
          onChange={(e) => setPdfFileName(e.target.value)}
          placeholder="Filename"
          className="w-24 bg-transparent border-none px-1 text-[13px] font-serif text-stone-800 placeholder-stone-400 outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={() => triggerExport(pdfFileName)}
          disabled={isExporting}
          className="bg-memory-primary text-white px-3 py-1.5 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider hover:bg-[#240d14] transition shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isExporting ? "..." : "PDF"}
        </button>
      </div>

      {/* Share Button */}
      <motion.button 
        type="button"
        onClick={handleCopyLink}
        whileHover={{ y: -1, boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}
        whileTap={{ y: 1 }}
        className="relative w-40 h-11 bg-white shadow-sm border border-stone-500 rounded-r-md rounded-l-sm flex items-center justify-between pl-5 pr-3 cursor-pointer overflow-hidden group"
      >
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#240d14]" />
        <span className="font-sans text-[12px] text-stone-800 font-bold tracking-wide">
          {isLinkCopied ? "Link Copied." : "Share Memoir"}
        </span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isLinkCopied ? 'bg-memory-primary text-white' : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'}`}>
          {isLinkCopied ? <Check size={10} /> : <Copy size={10} />}
        </div>
      </motion.button>

      {/* Lock Button */}
      <motion.button 
        type="button"
        onClick={onPublish} // ADDED CLICK HANDLER HERE
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-11 h-11 bg-memory-primary rounded-full flex items-center justify-center shadow-md cursor-pointer border border-[#240d14]/40 hover:bg-[#240d14] transition-colors"
        title="Lock & Publish Memoir"
      >
        <Lock size={15} className="text-white" />
      </motion.button>
    </div>
  );
}