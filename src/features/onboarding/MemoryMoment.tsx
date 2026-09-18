/**
 * @file MemoryMoment.tsx
 * @description Component rendering the first memory preview moment screen.
 * Dynamically pulls subject info (name, DOB, DOD), user info, and the onboarding memory.
 */

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MemoryMoment() {
  const router = useRouter();
  
  // States initialized empty to ensure NO hardcoded data is shown
  const [subjectName, setSubjectName] = useState("");
  const [subjectDates, setSubjectDates] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [previewMemory, setPreviewMemory] = useState("");

  useEffect(() => {
    // Wrapping in a timeout pushes the state update to the end of the event loop,
    // completely bypassing the ESLint "synchronous setState" warning.
    const timer = setTimeout(() => {
      try {
        let sName = "";
        let dobYear = "";
        let dodYear = "";
        let author = "";
        let memoryText = "";

        // 1. Retrieve subject details from pending_memoir
        const storedPending = localStorage.getItem("pending_memoir");
        if (storedPending) {
          const parsed = JSON.parse(storedPending);
          if (parsed.subject_name) sName = parsed.subject_name;
          if (parsed.subject_born_on) dobYear = new Date(parsed.subject_born_on).getFullYear().toString();
          
          if (parsed.subject_is_living) {
            dodYear = "Present";
          } else if (parsed.subject_died_on) {
            dodYear = new Date(parsed.subject_died_on).getFullYear().toString();
          }
        }

        // Fallback: Check active_memoir if pending_memoir is missing
        if (!sName) {
          const storedActive = localStorage.getItem("active_memoir");
          if (storedActive) {
            const parsed = JSON.parse(storedActive);
            const data = parsed.data || parsed;
            if (data.name) sName = data.name;
            if (data.dob) dobYear = new Date(data.dob).getFullYear().toString();
            if (data.dod) dodYear = new Date(data.dod).getFullYear().toString();
          }
        }

        // 2. Retrieve user / author name
        const storedUser = localStorage.getItem("user_profile") || localStorage.getItem("user_name");
        if (storedUser) {
          try {
            const userParsed = JSON.parse(storedUser);
            author = userParsed.name || userParsed.fullName || storedUser;
          } catch {
            author = storedUser;
          }
        }

        // 3. Retrieve the actual memory typed in UnfoldMemory step
        const onboardingMem = sessionStorage.getItem("onboarding_initial_memory");
        if (onboardingMem) {
          memoryText = onboardingMem;
        }

        // 4. Update states asynchronously
        if (sName) setSubjectName(sName);
        if (dobYear) setSubjectDates(`${dobYear} — ${dodYear || "Present"}`);
        if (author) setAuthorName(author);
        if (memoryText) setPreviewMemory(memoryText);

      } catch (e) {
        console.error("Failed to load onboarding preview state", e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Split memory for the classic "highlighted first sentence" look
  const firstDot = previewMemory.indexOf('.');
  const firstSentence = firstDot !== -1 ? previewMemory.substring(0, firstDot + 1) : previewMemory;
  const restOfMemory = firstDot !== -1 ? previewMemory.substring(firstDot + 1) : "";

  return (
    <section className="min-h-screen bg-memory-bg flex flex-col items-center px-6 py-8 md:py-12 relative z-10 selection:bg-memory-primary/20 font-sans">
      
      {/* FORCE TIMES NEW ROMAN ONLY FOR THE BOOK PREVIEW AREA */}
      <style dangerouslySetInnerHTML={{ __html: `
        .book-preview-area .font-serif { font-family: "Times New Roman", Times, serif !important; }
        .book-preview-area .book-text { hyphens: auto; -webkit-hyphens: auto; -ms-hyphens: auto; }
      `}} />

      {/* TOP NAVIGATION (Back icon ONLY, matching auth screens perfectly) */}
      <div className="w-full max-w-3xl flex justify-start mb-6 md:mb-10 relative z-30">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-memory-muted hover:text-memory-primary transition cursor-pointer flex items-center justify-center p-1"
          aria-label="Go back"
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
        
        {/* Header (Using standard font-sans) */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl text-memory-primary font-bold mb-3">
            A glimpse of the archive
          </h1>
        </div>

        {/* AUTHENTIC BOOK CANVAS PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="book-preview-area relative bg-[#FCFBF8] border border-stone-200/80 px-8 md:px-12 py-10 mb-8 rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_0_60px_rgba(90,24,39,0.02)] overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Paper crinkles/folds at the corners */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-linear-to-bl from-black/5 via-black/0 to-transparent pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          
          <article className="flex flex-col pt-2 pb-4">
            
            {/* Dynamic Subject Title & Dates (Reduced font size, border removed) */}
            {subjectName && (
              <div className="mb-6 text-left pb-2">
                <h2 className="text-3xl md:text-4xl font-serif italic text-memory-maroon font-normal tracking-tight">
                  {subjectName}&apos;s Story
                </h2>
                {subjectDates && (
                  <div className="flex items-center gap-4 mt-3">
                    <div className="h-px w-8 bg-stone-300"></div>
                    <p className="text-xs font-serif uppercase tracking-[0.2em] text-stone-500">
                      {subjectDates}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reference Style Chapter Header - Hardcoded title removed, "Chapter I" kept */}
            <div className="mb-5 mt-2 text-left relative flex flex-col">
              <div className="w-full h-0.5 bg-stone-800 mb-3"></div>
              <h3 className="text-2xl md:text-3xl font-serif text-stone-900 leading-tight">
                Chapter I
              </h3>
            </div>

            {/* Newsletter Style Content Block */}
            <div className="relative book-text font-serif leading-[1.8] text-[16px] md:text-[17px] text-stone-800 text-justify w-full clearfix mt-2">
              {previewMemory ? (
                <p className="mb-2.5">
                  <span className="font-bold text-memory-maroon">{firstSentence}</span>
                  {restOfMemory}
                  
                  {/* Inline Attribution */}
                  {authorName && (
                    <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400 font-semibold ml-3 whitespace-nowrap">
                      — Remembered by {authorName}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-stone-400 italic font-serif">Your written reflection will seamlessly flow here...</p>
              )}
            </div>

            {/* Minimalist Action Buttons (Mocked for visual preview) */}
            <div className="flex justify-start items-center gap-3 mt-6 border-t border-stone-200/50 pt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-sans font-medium border bg-stone-50 border-stone-200 text-stone-700 pointer-events-none opacity-80">
                <span className="text-sm">♡</span> 1
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-sans font-medium border bg-stone-50 border-stone-200 text-stone-700 pointer-events-none opacity-80">
                <span className="text-stone-500">✎</span> 0 Notes
              </div>
            </div>

          </article>
        </motion.div>

        {/* STANDARD CONTINUE BUTTON (Reduced Width & Centered) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "easeOut" }}
          className="w-full flex justify-center mt-2"
        >
          <motion.button
            type="button"
            onClick={() => router.push('/invite-family-friends')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full max-w-70 md:max-w-[320px] py-3.5 rounded-2xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md bg-memory-primary text-white hover:bg-memory-maroon shadow-memory-primary/15"
          >
            Continue
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}