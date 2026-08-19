'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/api/client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupForm() {
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert('Sign up failed: ' + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: dbError } = await supabase
        .from('user_account')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: full_name,
          },
        ]);

      if (dbError) {
        alert('Account created, but failed to save profile name.');
        console.error(dbError);
      } else {
        router.push('/small-personal-context');
      }
    }
    setLoading(false);
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
            href="/"
            className="text-[#78716c] hover:text-[#381c24] text-[15px] font-medium transition inline-flex items-center gap-1"
          >
            ←
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] leading-snug">
            Let’s create a safe space <br className="hidden sm:block" /> for your memories
          </h1>

          <div className="flex flex-col text-[15px] text-[#78716c] whitespace-nowrap">
            <span>Have an account?</span>
            <Link
              href="/login"
              className="text-[#381c24] font-semibold hover:underline transition mt-0.5"
            >
              Login
            </Link>
          </div>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Full Name*"
              value={full_name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />

            <input
              type="password"
              placeholder="Confirm Password*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className={`w-full mt-2 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md ${
              !loading
                ? 'bg-[#381c24] text-white hover:bg-[#4a222a] shadow-[#381c24]/10'
                : 'bg-[#f0e4d3] text-[#78716c] cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? 'Creating account...' : 'Continue'}
          </motion.button>
        </form>

        <p className="text-center text-sm font-serif text-[#78716c] mt-8">
          By clicking create an account you agree to the{' '}
          <span className="text-[#381c24] font-medium cursor-pointer hover:underline underline-offset-2">
            Terms and Conditions
          </span>
        </p>
      </motion.div>
    </section>
  );
}