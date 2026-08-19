'use client';

import { useState } from 'react';
import { Heart, Users, Sparkles, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SmallPersonalContext() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    {
      id: 'family',
      label: 'My family',
      description: 'The people who shaped my story.',
      icon: Users,
    },
    {
      id: 'parents',
      label: 'My parents',
      description: 'Their memories, their journey, their love.',
      icon: Heart,
    },
    {
      id: 'special',
      label: 'Someone special',
      description: 'Someone whose story means a lot to me.',
      icon: Sparkles,
    },
    {
      id: 'other',
      label: 'Someone else',
      description: 'I have someone else in mind.',
      icon: Plus,
    },
  ];

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
            className="text-[#78716c] hover:text-[#381c24] text-[15px] font-medium transition inline-flex items-center gap-1"          >
            <ArrowLeft size={18} strokeWidth={1.7} />

          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] mb-3">
            Who is this memory for?
          </h1>

          <p className="text-[#78716c] text-[15px] md:text-base leading-relaxed max-w-[520px] mx-auto font-serif italic">
            Tell us who is at the heart of this story.
            <br className="hidden sm:block" />
            Just a little context is enough.
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative flex flex-col p-6 rounded-2xl border text-left transition-colors duration-200 cursor-pointer ${isSelected
                  ? 'border-[#381c24] bg-[#fdf8ed] shadow-xs'
                  : 'border-[#f0e4d3] bg-white hover:border-[#c9a063]'
                  }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${isSelected
                    ? 'border-[#381c24] bg-[#381c24] text-white'
                    : 'border-[#f0e4d3] bg-white text-transparent'
                    }`}
                >
                  <span className="text-xs">✓</span>
                </div>

                {/* Icon */}
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition ${isSelected
                    ? 'bg-[#381c24] text-white'
                    : 'bg-[#faf8f5] text-[#381c24]'
                    }`}
                >
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Text */}
                <h2 className="text-[16px] font-semibold text-[#381c24] font-serif">
                  {option.label}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-[#78716c]">
                  {option.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="mb-8 text-center">
          <p className="text-sm font-serif italic text-[#78716c]">
            Some stories are worth keeping close.
          </p>
        </div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={() => router.push('/handwritten-note')}
          disabled={!selected}
          whileHover={selected ? { scale: 1.01 } : {}}
          whileTap={selected ? { scale: 0.99 } : {}}
          className={`w-full py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md ${selected
            ? 'bg-[#381c24] text-white hover:bg-[#4a222a] shadow-[#381c24]/10'
            : 'bg-[#f0e4d3] text-[#78716c] cursor-not-allowed shadow-none'
            }`}
        >
          Continue
          <ArrowRight size={19} strokeWidth={2} />
        </motion.button>

      </motion.div>
    </section>
  );
}