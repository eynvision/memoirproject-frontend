'use client';

import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Sparkles,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function InviteFamilyFriends() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-[#faf8f5] text-[#381c24] flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-[#381c24] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[680px] bg-white border border-[#f0e4d3] rounded-3xl px-8 md:px-12 py-10 shadow-sm flex flex-col"
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

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] mb-3">
            Some memories are
            <br />
            better shared.
          </h1>

          {/* Supporting Text */}
          <p className="text-[#78716c] text-[15px] md:text-base leading-relaxed max-w-[420px] mx-auto font-serif italic mb-8">
            Invite the people who were part of the story.
          </p>

          {/* Visual Network Graphic */}
          <div className="relative mb-10 flex h-60 w-full max-w-md items-center justify-center rounded-2xl border border-[#f0e4d3] bg-[#fdf8ed] shadow-2xs overflow-hidden">

            {/* Horizontal Connection */}
            <div className="absolute h-px w-36 bg-[#f0e4d3]" />

            {/* Vertical Connection */}
            <div className="absolute h-28 w-px bg-[#f0e4d3]" />

            {/* Center Memory */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 flex h-18 w-18 items-center justify-center rounded-full border border-[#f0e4d3] bg-white shadow-xs"
            >
              <Heart
                size={28}
                fill="#fdf8ed"
                className="text-[#381c24]"
                strokeWidth={1.5}
              />
            </motion.div>

            {/* Person 1 */}
            <motion.div 
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute left-[16%]"
              style={{ top: '25%' }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f0e4d3] bg-white text-[#381c24] shadow-xs">
                <Users size={20} strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Person 2 */}
            <motion.div 
              animate={{ y: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute right-[16%]"
              style={{ top: '25%' }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f0e4d3] bg-white text-[#381c24] shadow-xs">
                <Users size={20} strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Person 3 */}
            <motion.div 
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              className="absolute bottom-[14%] left-1/2 -translate-x-1/2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f0e4d3] bg-white text-[#381c24] shadow-xs">
                <Users size={20} strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Visual Caption */}
            <p className="absolute bottom-3 text-xs font-serif italic text-[#78716c]">
              The people who make the story yours
            </p>

          </div>

          {/* Buttons */}
          <div className="w-full max-w-md flex flex-col gap-3">
            {/* Primary */}
            <motion.button
              type="button"
              onClick={() => router.push('/signup')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-[#381c24] text-white hover:bg-[#4a222a] shadow-md shadow-[#381c24]/10"
            >
              Invite Family & Friends
            </motion.button>

            {/* Secondary */}
            <button
              type="button"
              onClick={() => router.push('/subscription')}
              className="py-2 text-sm font-medium text-[#78716c] hover:text-[#381c24] transition cursor-pointer font-serif"
            >
              Maybe later
            </button>
          </div>

        </div>

      </motion.div>
    </section>
  );
}