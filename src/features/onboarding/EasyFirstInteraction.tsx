'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mic, Pencil, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChooseFormat() {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const formats = [
    {
      id: 'voice',
      title: 'Speak it',
      icon: Mic,
    },
    {
      id: 'writing',
      title: 'Long-form story',
      icon: Pencil,
    },
    {
      id: 'photos',
      title: 'Add a photo',
      icon: Camera,
    },
  ];

  const handleContinue = () => {
    router.push('/story-prompt');
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
          <Link
            href="/handwritten-note"
            className="text-[#78716c] hover:text-[#381c24] text-[15px] font-medium transition inline-flex items-center gap-1"
          >
            ←
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] mb-3">
            How would you like
            <br />
            to remember?
          </h1>

          <p className="text-[#78716c] text-[15px] md:text-base leading-relaxed max-w-[520px] mx-auto font-serif italic">
            Choose the format that feels right for you. There is no right or wrong way to begin.
          </p>
        </div>

        {/* Format Options */}
        <div className="mb-10">
          <p className="text-[#381c24] text-xs uppercase tracking-widest font-bold mb-4">
            Select a format
          </p>

          <div className="grid grid-cols-3 gap-4">
            {formats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === format.id;

              return (
                <motion.button
                  key={format.id}
                  type="button"
                  onClick={() => setSelectedFormat(format.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`flex flex-col items-center justify-center gap-3 h-[110px] rounded-2xl border transition-colors duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#381c24] bg-[#fdf8ed] shadow-xs'
                      : 'border-[#f0e4d3] bg-white hover:border-[#c9a063]'
                  }`}
                >
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="text-[#381c24]"
                    />
                  </motion.div>

                  <span className="text-sm font-medium text-[#381c24] font-serif">
                    {format.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!selectedFormat}
          whileHover={selectedFormat ? { scale: 1.01 } : {}}
          whileTap={selectedFormat ? { scale: 0.99 } : {}}
          className={`w-full py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md ${
            selectedFormat
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