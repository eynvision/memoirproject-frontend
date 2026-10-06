/**
 * @file PricingFeatures.tsx
 * @description Pricing and features screen for the memoir experience.
 */

"use client";

import { motion } from "framer-motion";

import { ArrowLeft, BookOpen, Camera, Mic, PenLine } from "lucide-react";

import { useRouter } from "next/navigation";

const features = [
  {
    icon: PenLine,
    title: "Written Memories",
    description: "Write and preserve your stories",
  },
  {
    icon: Mic,
    title: "Voice Memories",
    description: "Keep voice memories and transcriptions",
  },
  {
    icon: Camera,
    title: "Photos & Videos",
    description: "Add the moments you want to remember",
  },
  {
    icon: BookOpen,
    title: "Final Memoir",
    description: "Create your memoir and beautiful PDF",
  },
];

const includedFeatures = [
  "Family Contributions",
  "Final Memoir",
  "Beautiful PDF",
];

export default function PricingFeatures() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/signup");
  };

  return (
    <main className="min-h-screen bg-memory-bg px-6 py-10 text-memory-primary md:px-10 md:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-hidden rounded-3xl border border-memory-primary/15 bg-[#FBF8F1] shadow-[0_20px_55px_rgba(80,45,35,0.10)]"
        >
          {/* Back Button */}
          <div className="px-7 pt-6 md:px-12">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="text-memory-muted hover:text-memory-primary text-[15px] font-medium transition inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={18} strokeWidth={1.7} />
            </button>
          </div>

          {/* Header */}
          <div className="px-7 py-8 text-center md:px-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-memory-accent">
              MEMOIR
            </p>

            <h1 className="font-serif text-[32px] font-normal leading-tight tracking-[-0.02em] md:text-[38px]">
              Pricing & Features
            </h1>

            <p className="mt-2 text-sm text-memory-muted">
              Everything you need to create your memoir.
            </p>
          </div>

          {/* Main Content with Inner Border */}
          <div className="mx-5 my-5 overflow-hidden rounded-2xl border border-memory-primary/15 md:mx-7 md:my-7">
            <div className="grid md:grid-cols-[1.2fr_0.8fr]">
              {/* Features */}
              <section className="px-7 py-8 md:px-10 md:py-10">
                <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-memory-accent">
                  WHAT&apos;S INCLUDED
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.08,
                        }}
                        className="border border-memory-primary/10 bg-memory-bg/40 p-5"
                      >
                        <Icon
                          size={21}
                          strokeWidth={1.5}
                          className="mb-4 text-memory-accent"
                        />

                        <h2 className="font-serif text-[18px] font-normal leading-snug tracking-[-0.01em]">
                          {feature.title}
                        </h2>

                        <p className="mt-2 text-[13px] leading-5 text-memory-muted">
                          {feature.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-7 border-t border-memory-primary/10 pt-6">
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {includedFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-xs text-memory-primary"
                      >
                        <span className="text-memory-accent">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Pricing */}
              <section className="flex flex-col justify-center border-t border-memory-primary/15 bg-memory-primary px-7 py-9 text-memory-light md:border-l md:border-t-0 md:px-10">
                <div className="text-center">
                  <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-memory-light/70">
                    CREATE YOUR MEMOIR
                  </p>

                  <div className="mt-5">
                    <span className="font-serif text-[68px] font-normal leading-none tracking-[-0.03em] md:text-[76px]">
                      $3
                    </span>
                  </div>

                  <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-memory-light/65">
                    ONE-TIME PAYMENT
                  </p>
                </div>

                <div className="my-8 h-px bg-memory-light/15" />

                <div className="space-y-3 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-memory-light/70">Access</span>
                    <span>Full Memoir Experience</span>
                  </p>

                  <p className="flex items-center justify-between">
                    <span className="text-memory-light/70">Payment</span>
                    <span>One-time</span>
                  </p>

                  <p className="flex items-center justify-between">
                    <span className="text-memory-light/70">Subscription</span>
                    <span>None</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-8 w-full rounded-full bg-memory-light px-6 py-4 text-sm font-semibold tracking-wide text-memory-primary shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#F1E3DF] hover:shadow-[0_8px_20px_rgba(80,45,35,0.25)]"
                >
                  Continue for $3 
                </button>

                <p className="mt-4 text-center text-[10px] text-memory-light/50">
                  No recurring charges
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}