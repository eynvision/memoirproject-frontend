'use client';

import Link from 'next/link';

export default function HandwrittenNote() {
  return (
    <section className="min-h-screen bg-[#faf8f5] text-[#381c24] flex flex-col items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-[#381c24] selection:text-white">

      {/* Note Card */}
      <div
        className="relative w-full max-w-[420px] bg-white border border-[#f0e4d3] shadow-lg shadow-[#381c24]/5 -rotate-1 transition-transform hover:rotate-0 duration-500 p-8 sm:p-10"
        style={{
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px'
        }}
      >
        {/* Lined Paper Lines */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            borderRadius: 'inherit', 
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 43px, #381c24 43px, #381c24 44px)',
            backgroundPositionY: '56px'
          }}
        />

        <div className="relative z-10">
          <h2 className="font-['Caveat'] text-center text-[36px] font-bold text-[#381c24] mb-4 -ml-2">
            Dear Hafsa!
          </h2>

          <p className="font-['Caveat'] text-[28px] text-[#381c24] leading-[44px]">
            Every family has a story worth keeping, the quiet mornings,
            the faded photographs, and the voices you never want to lose.
            We built this space to hold those precious pieces safe for you
            and the ones you love.
          </p>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 mt-12 w-full max-w-[420px]">
        <Link
          href="/easy-first-interaction"
          className="flex-1 text-center bg-white border border-[#f0e4d3] text-[#381c24] text-[16px] font-semibold py-4 rounded-xl hover:border-[#c9a063] transition shadow-xs"
        >
          Back
        </Link>

        <Link
          href="/easy-first-interaction"
          className="flex-1 text-center bg-[#381c24] text-white text-[16px] font-semibold py-4 rounded-xl hover:bg-[#4a222a] transition shadow-md"
        >
          Continue
        </Link>
      </div>

    </section>
  );
}