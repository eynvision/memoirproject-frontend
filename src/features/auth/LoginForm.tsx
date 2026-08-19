'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/api/client';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      if (data.user) {
        await supabase
          .from("user_account")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }
      router.push("/memoir");
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
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#381c24] leading-snug">
            Step back into <br /> your family&apos;s safe space
          </h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <div>
            <input
              type="password"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f0e4d3] bg-[#faf8f5] px-5 py-4 text-[16px] text-[#381c24] placeholder:text-[#78716c]/60 outline-none focus:border-[#c9a063] focus:ring-2 focus:ring-[#c9a063]/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <div className="flex justify-between items-center text-sm text-[#78716c] font-serif py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#f0e4d3] text-[#381c24] accent-[#381c24] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <a
              href="#"
              className="hover:text-[#381c24] transition underline underline-offset-2"
            >
              Forgot your password?
            </a>
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
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        {/* Footer Link */}
        <div className="border border-[#f0e4d3] rounded-2xl mt-8 py-4 text-center text-sm text-[#78716c] font-serif bg-[#faf8f5]">
          Not a member yet?{' '}
          <Link
            href="/signup"
            className="text-[#381c24] font-semibold ml-1 hover:underline underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </section>
  );
}