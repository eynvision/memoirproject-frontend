'use client';

import { ArrowLeft, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MemoryMoment() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-[#faf8f5] text-[#381c24] flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-[#381c24] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[720px] bg-white border border-[#f0e4d3] rounded-3xl px-8 md:px-12 py-10 shadow-sm"
      >

        {/* Back */}
        <div className="mb-6">
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
            Your first memory is ready
          </h1>

          <p className="text-[#78716c] text-[15px] md:text-base leading-relaxed max-w-[520px] mx-auto font-serif italic">
            This is a glimpse of how your contributions will look inside your permanent family archive.
          </p>
        </div>

        {/* Memoir Preview Container (Mirrors Final Memoir Structure) */}
        <div className="mb-8">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="overflow-hidden rounded-2xl border border-[#f0e4d3] bg-[#fdf8ed] p-6 md:p-8 shadow-xs relative"
          >
            {/* Header simulation */}
            <div className="flex items-center justify-between border-b border-[#f0e4d3] pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c9a063] font-bold">Chapter I</span>
                <h3 className="font-serif text-lg text-[#381c24]">Early Roots & Childhood</h3>
              </div>
              <span className="text-[11px] text-[#78716c] font-mono bg-white px-3 py-1 rounded-lg border border-[#f0e4d3]">
                Curated Memory
              </span>
            </div>

            {/* Memory Card Simulation */}
            <div className="bg-white rounded-2xl border border-[#f0e4d3] p-6 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#381c24] text-white text-xs font-bold flex items-center justify-center">
                    FH
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#381c24]">Hafsa Hashmi</h4>
                    <p className="text-[11px] text-[#78716c]">Recorded recently • Voice & Text Memoir</p>
                  </div>
                </div>
                <Heart size={16} fill="#381c24" className="text-[#381c24]" />
              </div>

              <p className="font-serif text-[16px] leading-relaxed text-[#292524] italic">
                “Some memories are made of the smallest moments, the quiet mornings, and the voices you never want to lose...”
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#78716c] font-serif italic">
                Your gradual reflections will automatically weave into chapters like this.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Small Emotional Line */}
        <div className="mb-8 text-center">
          <p className="font-serif text-sm italic text-[#78716c]">
            And this is only the beginning of your family&apos;s archive.
          </p>
        </div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={() => router.push('/invite-family-friends')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-[#381c24] text-white hover:bg-[#4a222a] shadow-md shadow-[#381c24]/10"
        >
          Continue Memoir
        </motion.button>

      </motion.div>
    </section>
  );
}