'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StoryPrompt() {
  const router = useRouter();
  const [story, setStory] = useState('');

  const prompts = [
    'A moment that still makes me smile',
    'Something they used to say',
    'A place I remember',
    'A little thing I miss',
  ];

  const handlePromptClick = (prompt: string) => {
    setStory((current) => {
      if (current.trim()) {
        return `${current}\n\n${prompt}: `;
      }
      return `${prompt}: `;
    });
  };

  return (
    <section className="min-h-screen bg-[#faf8f5] text-[#381c24] flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-[#381c24] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[680px] bg-white border border-[#f0e4d3] rounded-3xl px-8 md:px-12 py-10 shadow-sm"
      >

        {/* Back */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#78716c] hover:text-[#381c24] text-[15px] font-medium transition inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] mb-3">
            Let&apos;s bring one
            <br className="hidden sm:block" />
            memory to life.
          </h1>

          <p className="text-[#78716c] text-[15px] md:text-base leading-relaxed max-w-[520px] mx-auto font-serif italic">
            Start with a moment that still stays with you.
          </p>
        </div>

        {/* Writing Area */}
        <div className="mb-6">
          <div className="overflow-hidden rounded-2xl border border-[#f0e4d3] bg-[#faf8f5] shadow-xs transition-all duration-300 focus-within:border-[#c9a063] focus-within:ring-2 focus-within:ring-[#c9a063]/20">

            <div className="flex items-center gap-2 border-b border-[#f0e4d3] bg-[#fdf8ed] px-5 py-3">
              <Sparkles
                size={18}
                strokeWidth={1.5}
                className="text-[#381c24]"
              />
              <span className="font-serif text-[15px] italic text-[#381c24]">
                What comes to mind?
              </span>
            </div>

            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={`A birthday, a conversation, a place, a laugh…

Just write whatever you remember.`}
              rows={6}
              className="w-full resize-none bg-transparent px-5 py-4 text-[16px] leading-7 text-[#381c24] placeholder:text-[#78716c]/60 outline-none font-serif"
            />

            <div className="flex justify-end border-t border-[#f0e4d3] px-5 py-2.5 bg-white">
              <span className="text-xs font-medium text-[#78716c]">
                {story.length} characters
              </span>
            </div>

          </div>
        </div>

        {/* Inspiration */}
        <div className="mb-8">
          <p className="mb-3 text-center text-xs uppercase tracking-widest font-bold text-[#381c24]">
            Need a little inspiration?
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {prompts.map((prompt) => (
              <motion.button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="rounded-full border border-[#f0e4d3] bg-white px-4 py-2 text-sm font-serif text-[#78716c] transition-colors duration-200 hover:border-[#c9a063] hover:bg-[#fdf8ed] hover:text-[#381c24] cursor-pointer shadow-2xs"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={() => router.push('/memory-moment')}
          disabled={!story.trim()}
          whileHover={story.trim() ? { scale: 1.01 } : {}}
          whileTap={story.trim() ? { scale: 0.99 } : {}}
          className={`w-full py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md ${
            story.trim()
              ? 'bg-[#381c24] text-white hover:bg-[#4a222a] shadow-[#381c24]/10'
              : 'bg-[#f0e4d3] text-[#78716c] cursor-not-allowed shadow-none'
          }`}
        >
          Continue
        </motion.button>

      </motion.div>
    </section>
  );
}