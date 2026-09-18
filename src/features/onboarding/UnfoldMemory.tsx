/**
 * @file StoryPrompt.tsx
 * @description Component rendering the centered story prompt interface.
 * Prompts animate radially from behind the notepad step by step.
 * On hover, they pop in front of the notepad so the whole sentence is fully visible.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Defined outside the component to provide a stable reference across renders
const PROMPTS = [
  "A moment that still makes me smile",
  "Something they used to say",
  "A place I remember",
  "A little thing I miss",
  "A song we used to share",
  "The warmth of their laughter",
  "A lesson they left behind",
  "Quiet afternoons together",
];

// Coordinates to create the "round effect" fanning out from behind the central paper
const SCATTER_POSITIONS = [
  { x: -330, y: -180, rotate: -8 },  // Top Left 
  { x: -360, y: -80, rotate: -5 },   // Far High Left
  { x: 370, y: -60, rotate: 6 },     // Far High Right
  { x: -370, y: 40, rotate: -12 },   // Far Mid Left 
  { x: 350, y: 50, rotate: 8 },      // Far Mid Right
  { x: -310, y: 150, rotate: -15 },  // Bottom Left
  { x: 310, y: 140, rotate: 12 },    // Bottom Right
  { x: 360, y: -160, rotate: 5 },  // next to the first prompt
];

// Component that types out each prompt while moving it to its scattered position behind the paper
function HandwrittenPromptItem({
  promptText,
  isStarted,
  onSelect,
  targetPosition,
}: {
  promptText: string;
  isStarted: boolean;
  onSelect: (text: string) => void;
  targetPosition: { x: number; y: number; rotate: number };
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isStarted) return;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex <= promptText.length) {
        setDisplayedText(promptText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isStarted, promptText]);

  return (
    <motion.button
      type="button"
      onClick={() => isComplete && onSelect(promptText)}
      // Starts scaled down and hidden behind the paper with zIndex 10
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0, zIndex: 10 }}
      animate={
        isStarted
          ? {
              opacity: 1,
              x: targetPosition.x,
              y: targetPosition.y,
              scale: 1,
              rotate: targetPosition.rotate,
              zIndex: 10,
            }
          : { opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0, zIndex: 10 }
      }
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      // On hover: Pops to the very front (zIndex 50) and enlarges, background removed as requested
      whileHover={
        isComplete
          ? {
              scale: 1.15,
              zIndex: 50,
            }
          : {}
      }
      className={`absolute text-lg md:text-xl font-caveat text-memory-primary/85 transition-colors duration-200 hover:text-memory-maroon flex items-center justify-center gap-1 py-1 px-1.5 whitespace-nowrap pointer-events-auto ${
        isComplete ? "cursor-pointer" : "cursor-default"
      }`}
      style={{ pointerEvents: isStarted ? "auto" : "none" }}
    >
      <span>{displayedText}</span>
      {isStarted && !isComplete && (
        <span className="inline-block w-1.5 h-4 bg-memory-accent animate-pulse" />
      )}
    </motion.button>
  );
}

export default function UnfoldMemory() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    if (currentPromptIndex < PROMPTS.length - 1) {
      const currentTextLength = PROMPTS[currentPromptIndex].length;
      const typingDuration = currentTextLength * 40;
      const pauseDuration = 500;

      const timer = setTimeout(() => {
        setCurrentPromptIndex((prev) => prev + 1);
      }, typingDuration + pauseDuration);

      return () => clearTimeout(timer);
    }
  }, [currentPromptIndex]);

  // Restored: Clicking the prompt writes it automatically into the textarea
  const handlePromptClick = (prompt: string) => {
    setStory((current) => {
      if (current.trim()) {
        return `${current}\n\n${prompt}: `;
      }
      return `${prompt}: `;
    });
  };

  return (
    <section className="min-h-screen bg-memory-bg text-memory-primary flex flex-col items-center px-6 py-12 md:py-16 overflow-hidden relative z-10 font-sans selection:bg-memory-primary selection:text-white">
      {/* Top Nav & Header */}
      <div className="w-full max-w-4xl flex flex-col relative z-30">
        <div className="w-full mb-8 flex justify-start">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-memory-muted hover:text-memory-primary text-[15px] font-medium transition inline-flex items-center gap-1 cursor-pointer"
          >
            ←
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-8 w-full"
        >
          <h1 className="text-3xl md:text-4xl text-memory-primary leading-snug mb-3">
            Hold onto a moment that matters.
          </h1>
          <p className="text-memory-muted text-[15px] md:text-base leading-relaxed">
            Start with a moment that still stays with you.
          </p>
        </motion.div>
      </div>

      {/* Central Interactive Area */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg flex-1 mt-4">
        {/* THE CLOUD OF PROMPTS (Layered behind the notepad initially) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {PROMPTS.map((prompt, index) => (
            <HandwrittenPromptItem
              key={prompt}
              promptText={prompt}
              isStarted={index <= currentPromptIndex}
              onSelect={handlePromptClick}
              targetPosition={
                SCATTER_POSITIONS[index % SCATTER_POSITIONS.length]
              }
            />
          ))}
        </div>

        {/* THE NOTEPAD (Layered in front with z-20) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-20 w-full mb-6 pointer-events-auto group"
        >
          {/* Background Sheet 1 (Bottom of stack) - Changed to aged paper tone */}
          <div className="absolute inset-0 bg-[#DFD8CE] border border-memory-border/50 rounded-[8px_4px_12px_4px] shadow-sm transform rotate-2 translate-x-2 translate-y-1 transition-transform duration-500 group-hover:rotate-1 group-hover:translate-x-1" />

          {/* Background Sheet 2 (Middle of stack) - Changed to lighter aged paper tone */}
          <div className="absolute inset-0 bg-[#E8E2D9] border border-memory-border/50 rounded-[4px_12px_4px_8px] shadow-sm transform -rotate-2 -translate-x-1 translate-y-2 transition-transform duration-500 group-hover:-rotate-1" />

          {/* Main Top Sheet */}
          <div
            className="relative w-full rounded-[2px_12px_4px_16px] border border-memory-border bg-white shadow-[0_15px_40px_rgba(56,28,36,0.1)] transition-transform duration-500 group-hover:rotate-0 overflow-hidden"
            style={{
              transform: "rotate(-0.8deg)",
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 35px, var(--memory-border) 35px, var(--memory-border) 36px)",
              backgroundPositionY: "12px",
            }}
          >
            {/* Classic Vertical Margin Line */}
            <div className="absolute top-0 bottom-0 left-10 md:left-12 w-[1.5px] bg-memory-maroon/20 z-0 pointer-events-none" />

            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write your one-line memory here..."
              rows={7}
              className="w-full resize-none bg-transparent pl-14 md:pl-16 pr-7 py-7 text-[20px] leading-9 text-memory-primary placeholder:text-memory-muted outline-none font-caveat relative z-10"
            />
          </div>
        </motion.div>

        {/* CONTINUE BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="relative z-20 w-full max-w-sm pointer-events-auto"
        >
          <motion.button
            type="button"
            onClick={() => {
              if (story.trim()) {
                sessionStorage.setItem("onboarding_initial_memory", story.trim());
              }
              router.push("/memory-moment");
            }}
            disabled={!story.trim()}
            whileHover={story.trim() ? { scale: 1.01 } : {}}
            whileTap={story.trim() ? { scale: 0.99 } : {}}
            className={`w-full py-4 rounded-2xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md ${
              story.trim()
                ? "bg-memory-primary text-white hover:bg-memory-maroon shadow-memory-primary/15"
                : "bg-memory-border/70 text-memory-muted cursor-not-allowed shadow-none"
            }`}
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}