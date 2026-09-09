"use client";
import { useEffect, useState, useRef } from "react";
import type { Memoir } from "@/features/memoir/schemas";
import type { Memory } from "@/features/memory/schemas";

export function ScrollBook({ memoir, memories }: { memoir: Memoir; memories: Memory[] }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      let p = scrolled / scrollableDistance;
      p = Math.max(0, Math.min(1, p));
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalLeaves = 4;
  const getLeafRotation = (index: number) => {
    const start = index * (1 / totalLeaves);
    const end = (index + 1) * (1 / totalLeaves);
    if (progress <= start) return 0;
    if (progress >= end) return -180;
    const percentage = (progress - start) / (end - start);
    return -(percentage * 180);
  };

  let translateX = "-50%";
  if (progress > 0 && progress <= 0.25) {
    const pct = progress / 0.25;
    translateX = `-${50 * (1 - pct)}%`;
  } else if (progress > 0.25) {
    translateX = "0%";
  }

  const birthYear = memoir.subject_born_on ? new Date(memoir.subject_born_on).getFullYear() : "Unknown";
  const endYear = memoir.subject_died_on ? new Date(memoir.subject_died_on).getFullYear() : (memoir.subject_is_living ? "Present" : "Unknown");

  const pages = [
    memories[0] || { title: "Chapter 1: The Early Years", body_text: "Every story has a beginning..." },
    memories[1] || { title: "Chapter 2: Love & Family", body_text: "It wasn't always easy, but it was always worth it..." },
    memories[2] || { title: "Chapter 3: The Golden Years", body_text: "Looking back, the memories that shine brightest..." }
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden" style={{ perspective: '2500px' }}>
        <div
          className="relative aspect-[3/4] w-[85vw] max-w-[450px] md:w-[40vw] transition-transform duration-100 ease-out"
          style={{ transformStyle: 'preserve-3d', transform: `translateX(${translateX})` }}
        >
          <Leaf rotation={getLeafRotation(3)} zIndex={10}>
            <FrontFace className="rounded-r-xl bg-[#FDFBF7] p-8 md:p-12 shadow-[inset_15px_0_20px_-15px_rgba(0,0,0,0.2)]">
              <h2 className="font-heading text-3xl text-amber-950">{pages[2].title}</h2>
              <p className="mt-4 text-amber-900/80 leading-relaxed text-sm md:text-base line-clamp-[15]">
                {pages[2].body_text}
              </p>
            </FrontFace>
            <BackFace className="rounded-l-xl border-l-[12px] border-[#2A170C] bg-[#4A2C1A] flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full border border-amber-900/40 opacity-50 bg-[#3A2214]"></div>
              <p className="mt-4 text-sm tracking-widest text-amber-50/50 uppercase text-center">Preserved for generations</p>
            </BackFace>
          </Leaf>

          <Leaf rotation={getLeafRotation(2)} zIndex={20}>
            <FrontFace className="rounded-r-xl bg-[#FDFBF7] p-8 md:p-12 shadow-[inset_15px_0_20px_-15px_rgba(0,0,0,0.2)]">
              <h2 className="font-heading text-3xl text-amber-950">{pages[1].title}</h2>
              <p className="mt-4 text-amber-900/80 leading-relaxed text-sm md:text-base line-clamp-[15]">
                {pages[1].body_text}
              </p>
            </FrontFace>
            <BackFace className="rounded-l-xl bg-[#FDFBF7] p-8 md:p-12 shadow-[inset_-15px_0_20px_-15px_rgba(0,0,0,0.2)]">
              <div className="flex h-56 w-full items-center justify-center rounded-xl bg-amber-900/10 mb-6">
                <span className="text-amber-900/40 text-sm font-medium">Memory Photograph</span>
              </div>
            </BackFace>
          </Leaf>

          <Leaf rotation={getLeafRotation(1)} zIndex={30}>
            <FrontFace className="rounded-r-xl bg-[#FDFBF7] p-8 md:p-12 shadow-[inset_15px_0_20px_-15px_rgba(0,0,0,0.2)]">
              <h2 className="font-heading text-3xl text-amber-950">{pages[0].title}</h2>
              <p className="mt-4 text-amber-900/80 leading-relaxed text-sm md:text-base line-clamp-[15]">
                {pages[0].body_text}
              </p>
            </FrontFace>
            <BackFace className="rounded-l-xl bg-[#FDFBF7] p-8 md:p-12 shadow-[inset_-15px_0_20px_-15px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center text-center">
              <h3 className="font-heading text-2xl text-amber-950 mb-4">A Note to the Reader</h3>
              <div className="w-12 h-px bg-amber-900/30 mb-6"></div>
              <p className="text-amber-900/80 leading-relaxed">
                This book contains the collected memories, photographs, and voice recordings of a lifetime.
              </p>
            </BackFace>
          </Leaf>

          <Leaf rotation={getLeafRotation(0)} zIndex={40}>
            <FrontFace className="flex flex-col items-center justify-center rounded-r-xl border-l-[12px] border-[#2A170C] bg-[#4A2C1A] p-8 text-center text-amber-50 shadow-2xl">
              <div className="absolute inset-4 rounded-lg border border-amber-50/10 pointer-events-none"></div>
              <h1 className="mb-6 font-heading text-3xl md:text-4xl text-amber-50/80">In Loving Memory Of</h1>
              <h2 className="mb-10 font-heading text-5xl md:text-6xl text-amber-400">{memoir.subject_name}</h2>
              <div className="w-24 h-px bg-amber-50/20 mb-6"></div>
              <p className="text-lg tracking-[0.3em] uppercase text-amber-50/60">
                {birthYear} - {endYear}
              </p>
            </FrontFace>
            <BackFace className="rounded-l-xl bg-[#FDFBF7] p-8 shadow-[inset_-15px_0_20px_-15px_rgba(0,0,0,0.2)]">
              <div className="h-full w-full border-2 border-dashed border-amber-900/10 flex items-center justify-center p-8">
                <p className="text-center text-amber-900/50 italic font-medium">Inside Cover</p>
              </div>
            </BackFace>
          </Leaf>
        </div>
      </div>
      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${progress > 0.05 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs uppercase tracking-widest text-amber-50/50 font-medium">Scroll to Open</span>
          <div className="w-px h-8 bg-amber-50/30"></div>
        </div>
      </div>
    </div>
  );
}

function Leaf({ rotation, zIndex, children }: { rotation: number, zIndex: number, children: React.ReactNode }) {
  return (
    <div
      className="absolute right-0 top-0 h-full w-full origin-left will-change-transform"
      style={{
        zIndex,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${zIndex}px) rotateY(${rotation}deg)`
      }}
    >
      {children}
    </div>
  );
}

function FrontFace({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`absolute inset-0 h-full w-full ${className}`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
      {children}
    </div>
  );
}

function BackFace({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`absolute inset-0 h-full w-full ${className}`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
      {children}
    </div>
  );
}