'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Subscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      router.push('/memoir');
    }, 1000);
  };

  return (
    <section className="min-h-screen bg-[#faf8f5] text-[#381c24] flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-[#381c24] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[680px] bg-white border border-[#f0e4d3] rounded-3xl px-8 md:px-12 py-10 shadow-sm"
      >
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/invite-family-friends"
            className="text-[#78716c] hover:text-[#381c24] text-[15px] font-medium transition inline-flex items-center gap-1"
          >
            ←
          </Link>
        </div>

        {/* Top Header */}
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-center mb-8 text-[#381c24]">
          Complete Your Subscription
        </h1>

        <div className="flex justify-between items-center mb-2">
          <Link href="/memoir" className="group inline-block">
            <h2 className="font-serif text-2xl text-[#381c24] group-hover:underline transition-all">
              Payment
            </h2>
          </Link>

          <div className="flex gap-2">
            <img
              src="/visa.png"
              alt="Visa"
              className="w-10 h-10 object-contain"
            />
            <img
              src="/masterCard.png"
              alt="Mastercard"
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
        <p className="text-[15px] font-serif italic text-[#78716c] mb-6">
          All transactions are secure and encrypted
        </p>

        <form onSubmit={handlePay} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Card number"
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Expiration date (MM/YY)"
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />

            <input
              type="text"
              placeholder="Security code"
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Name on card"
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className={`w-full mt-2 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md ${!loading
                ? 'bg-[#381c24] text-white hover:bg-[#4a222a] shadow-[#381c24]/10'
                : 'bg-[#f0e4d3] text-[#78716c] cursor-not-allowed shadow-none'
              }`}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}