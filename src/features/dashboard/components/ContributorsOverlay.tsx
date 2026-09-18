"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ContributorsOverlayProps {
  showContributors: boolean;
  setShowContributors: (val: boolean) => void;
  contributorNames: { name: string; top: string; left: string; size: string; scale: number; blur: string; }[];
}

export function ContributorsOverlay({ showContributors, setShowContributors, contributorNames }: ContributorsOverlayProps) {
  return (
    <AnimatePresence>
      {showContributors && (
        <motion.div 
          key="contributors-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className={`fixed inset-0 z-100 bg-stone-950/70 backdrop-blur-3xl overflow-hidden ${showContributors ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className="absolute bottom-10 right-10 z-50">
            <motion.button 
              type="button"
              onClick={() => setShowContributors(false)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white/10 hover:bg-white/20 text-memory-light border border-white/20 px-8 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 shadow-2xl cursor-pointer flex items-center gap-3 backdrop-blur-md"
            >
              <span>Return to Desk</span> <X size={18} />
            </motion.button>
          </div>

          {contributorNames.map((person, idx) => (
            <motion.div
              key={`contributor-${person.name}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: [0, -15, 0],
                scale: person.scale
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: 10,
                transition: { duration: 0.2 } 
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: idx * 0.1 },
                scale: { duration: 0.8, delay: idx * 0.1 },
                y: { 
                  duration: 5 + (idx % 4), 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: idx * 0.2
                }
              }}
              className={`absolute font-sans font-light tracking-widest text-memory-light drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-3 select-none pointer-events-none ${person.size} ${person.blur}`}
              style={{ top: person.top, left: person.left }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse opacity-80 shadow-[0_0_8px_#D4A373]" />
              {person.name}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}