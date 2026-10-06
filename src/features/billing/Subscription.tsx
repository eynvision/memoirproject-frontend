/**
 * @file subscription.tsx
 * @description Client-side React component that renders the secure payment
 * and subscription form, refactored for complete typography, label, and frame consistency with login and signup.
 */

"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import Image from "next/image";

import { motion } from "framer-motion";

import { ArrowLeft } from "lucide-react";

export default function Subscription() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <section className="min-h-screen bg-memory-bg text-memory-primary flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-memory-primary selection:text-memory-light">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-150 bg-memory-card border border-memory-border rounded-3xl px-8 md:px-12 py-10 shadow-sm"
      >
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/login"
            aria-label="Go back"
            className="text-memory-muted hover:text-memory-primary text-[15px] font-medium transition inline-flex items-center gap-1"
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
          </Link>
        </div>

        {/* Top Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl text-memory-primary leading-snug">
            Complete Your Subscription
          </h1>
        </div>

        <div className="flex justify-between items-center mb-2">
          <Link href="/" className="group inline-block">
            <h2 className="font-serif text-2xl text-memory-primary group-hover:underline transition-all">
              Payment
            </h2>
          </Link>

          <div className="flex gap-2">
            <Image
              src="/visa.png"
              alt="Visa"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />

            <Image
              src="/masterCard.png"
              alt="Mastercard"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>

        <p className="text-[15px] font-serif italic text-memory-muted mb-6">
          All transactions are secure and encrypted
        </p>

        <form onSubmit={handlePay} className="flex flex-col gap-4">
          {/* Card Number */}
          <div>
            <label
              htmlFor="card-number"
              className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
            >
              Card Number
              <span
                aria-hidden="true"
                className="ml-1 text-memory-required"
              >
                *
              </span>
            </label>

            <input
              id="card-number"
              type="text"
              placeholder="e.g. 4242 4242 4242 4242"
              className="w-full rounded-xl border border-memory-border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary placeholder:text-memory-muted/60 outline-none focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          {/* Expiration Date & Security Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="card-expiry"
                className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
              >
                Expiration Date
                <span
                  aria-hidden="true"
                  className="ml-1 text-memory-required"
                >
                  *
                </span>
              </label>

              <input
                id="card-expiry"
                type="text"
                placeholder="MM/YY"
                className="w-full rounded-xl border border-memory-border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary placeholder:text-memory-muted/60 outline-none focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 transition-all duration-300 font-serif shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="card-cvc"
                className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
              >
                Security Code
                <span
                  aria-hidden="true"
                  className="ml-1 text-memory-required"
                >
                  *
                </span>
              </label>

              <input
                id="card-cvc"
                type="text"
                placeholder="CVC"
                className="w-full rounded-xl border border-memory-border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary placeholder:text-memory-muted/60 outline-none focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 transition-all duration-300 font-serif shadow-2xs"
              />
            </div>
          </div>

          {/* Name on Card */}
          <div>
            <label
              htmlFor="card-name"
              className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
            >
              Name on Card
              <span
                aria-hidden="true"
                className="ml-1 text-memory-required"
              >
                *
              </span>
            </label>

            <input
              id="card-name"
              type="text"
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-memory-border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary placeholder:text-memory-muted/60 outline-none focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 transition-all duration-300 font-serif shadow-2xs"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className={`w-full mt-2 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md ${
              !loading
                ? "bg-memory-primary text-memory-light hover:bg-memory-maroon shadow-memory-primary/10"
                : "bg-memory-border text-memory-muted cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? "Processing..." : "Pay Now"}
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}