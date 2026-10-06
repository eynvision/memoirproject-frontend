/**
 * @file MemorySubjectSelection.tsx
 * @description Component rendering memory subject cards in an interactive 3D Coverflow
 * stacked deck carousel with drag/swipe and keyboard arrow navigation, styled with a warm heirloom aesthetic,
 * perfectly aligned with login/signup container specs, field sizes, and spacing, with strict TypeScript types.
 */

"use client";

import { useState, useEffect, ChangeEvent } from "react";

import { useRouter } from "next/navigation";

import { motion, PanInfo } from "framer-motion";

import {
  ArrowLeft,
  Heart,
  Shield,
  Users,
  Sparkles,
  Star,
} from "lucide-react";

interface OptionItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Heart;
}

export default function MemorySubjectSelection() {
  const router = useRouter();

  const options: OptionItem[] = [
    {
      id: "mother",
      label: "Mother",
      description: "The gentle heart that raised me.",
      icon: Heart,
    },
    {
      id: "father",
      label: "Father",
      description: "The steady hand and guiding light.",
      icon: Shield,
    },
    {
      id: "sibling",
      label: "A sibling",
      description: "A lifelong bond of shared secrets and years.",
      icon: Users,
    },
    {
      id: "friend",
      label: "A dear friend",
      description: "A chosen soul who walked beside me.",
      icon: Sparkles,
    },
    {
      id: "other",
      label: "Someone special",
      description: "Someone whose story means everything to me.",
      icon: Star,
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number>(2); // Center card (Index 2 of 0-4)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [step, setStep] = useState<"flipping" | "details">("flipping");

  // Inscription form state
  const [name, setName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [dod, setDod] = useState<string>("");
  const [isAlive, setIsAlive] = useState<boolean>(true);

  // Validation error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keyboard arrow navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (step !== "flipping") return;

      if (e.key === "ArrowRight" && activeIndex < options.length - 1) {
        setActiveIndex((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, options.length, step]);

  const handleCardClick = (index: number, id: string): void => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    } else {
      setSelectedOption(id);
      setStep("details");
      setErrorMessage(null);
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const swipeThreshold = 40;

    if (
      info.offset.x < -swipeThreshold &&
      activeIndex < options.length - 1
    ) {
      setActiveIndex((prev) => prev + 1);
    } else if (info.offset.x > swipeThreshold && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = (): void => {
    setErrorMessage(null);

    // Lightweight validation checks
    if (!name.trim()) {
      setErrorMessage("Please enter their name to continue.");
      return;
    }

    if (!dob.trim()) {
      setErrorMessage("Please select their date of birth.");
      return;
    }

    if (!isAlive && !dod.trim()) {
      setErrorMessage(
        'Please select their date of passing, or check "Still with us".'
      );
      return;
    }

    // Package the onboarding details into localStorage for memoir creation post-signup
    const memoirDraft = {
      subject_name: name.trim(),
      subject_born_on: dob.trim(),
      subject_died_on: isAlive ? null : dod.trim(),
      subject_is_living: isAlive,
      description: `A memoir dedicated to my ${
        selectedOption || "loved one"
      }.`,
    };

    localStorage.setItem("pending_memoir", JSON.stringify(memoirDraft));

    // Proceed to your signup / authentication screen
    router.push("/handwritten-note");
  };

  return (
    <section className="min-h-screen bg-memory-bg text-memory-primary flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-memory-primary selection:text-memory-light">
      {/* Main content wrapper perfectly consistent with Login/Signup frame and spacing */}
      <div className="w-full max-w-170 flex flex-col items-center">
        {/* Consistent Back Button */}
        <div className="mb-8 w-full flex justify-start">
          <button
            type="button"
            onClick={() => {
              if (step === "details") {
                setStep("flipping");
                setErrorMessage(null);
              } else {
                router.back();
              }
            }}
            className="text-memory-muted hover:text-memory-primary text-[15px] font-medium transition inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
          </button>
        </div>

        {step === "flipping" ? (
          <>
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl text-memory-primary leading-snug">
                Whose voice do you want <br className="hidden sm:block" /> to
                keep close forever?
              </h1>
            </motion.div>

            {/* 3D Coverflow Carousel Deck View with Drag Support */}
            <div className="relative w-full max-w-xl h-115 flex items-center justify-center overflow-visible mb-6 cursor-grab active:cursor-grabbing">
              {options.map((option, index) => {
                const offset = index - activeIndex;
                const absOffset = Math.abs(offset);
                const xOffset = offset * 220;
                const scale =
                  absOffset === 0 ? 1 : absOffset === 1 ? 0.84 : 0.7;
                const opacity =
                  absOffset === 0 ? 1 : absOffset === 1 ? 0.7 : 0.35;
                const zIndex = 10 - absOffset;
                const isCenter = absOffset === 0;
                const IconComponent = option.icon;

                return (
                  <motion.div
                    key={option.id}
                    onClick={() => handleCardClick(index, option.id)}
                    drag={isCenter ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className={`absolute w-72 bg-white rounded-3xl p-8 shadow-2xl cursor-pointer flex flex-col justify-between border select-none text-center ${
                      isCenter
                        ? "border-memory-accent shadow-memory-primary/10"
                        : "border-memory-border"
                    }`}
                    animate={{
                      x: xOffset,
                      scale: scale,
                      opacity: opacity,
                      zIndex: zIndex,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 32,
                    }}
                  >
                    {/* Warm Keepsake Circular Emblem Badge */}
                    <div className="flex flex-col items-center pt-2">
                      <div className="w-16 h-16 rounded-full bg-memory-bg border border-memory-border flex items-center justify-center mb-6 shadow-2xs">
                        <IconComponent className="w-7 h-7 text-memory-primary stroke-[1.5]" />
                      </div>

                      {/* Card Content */}
                      <div className="pointer-events-none w-full">
                        <h2 className="text-2xl text-memory-primary mb-3 font-bold">
                          {option.label}
                        </h2>

                        <p className="text-sm text-memory-muted leading-relaxed mb-8 font-serif italic max-w-50 mx-auto">
                          &ldquo;{option.description}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-4 border-t border-memory-border/50 flex items-center justify-between pointer-events-none w-full">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-memory-primary">
                        {isCenter ? "Click to Inscribe" : "Select Card"}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-memory-primary text-memory-light flex items-center justify-center text-xs shadow-md">
                        →
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination indicator dots */}
            <div className="flex items-center gap-2 mt-2">
              {options.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === i
                      ? "w-8 bg-memory-primary"
                      : "w-2 bg-memory-border hover:bg-memory-muted"
                  }`}
                  aria-label={`Go to card ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          /* DETAIL INSCRIPTION PAGE - Perfectly matched to Login/Signup layout and field sizing */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-memory-card border border-memory-border rounded-3xl px-8 md:px-12 py-10 shadow-sm"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl text-memory-primary leading-snug">
                Inscribed for{" "}
                <span className="text-memory-accent italic">
                  {options.find((o) => o.id === selectedOption)?.label}
                </span>
              </h1>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-memory-card border border-memory-border text-memory-primary rounded-xl text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="subject-name"
                  className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
                >
                  Their Name
                  <span
                    aria-hidden="true"
                    className="ml-1 text-memory-required"
                  >
                    *
                  </span>
                </label>

                <input
                  id="subject-name"
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. Fatima Khan"
                  className="w-full rounded-xl border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary placeholder:text-memory-muted/60 outline-none transition-all duration-300 shadow-2xs border-memory-border focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20"
                />
              </div>

              {/* Dates Grid with Calendar Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="subject-dob"
                    className="block text-xs uppercase tracking-widest font-bold text-memory-primary/70 mb-1.5"
                  >
                    Date of Birth
                    <span
                      aria-hidden="true"
                      className="ml-1 text-memory-required"
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="subject-dob"
                    type="date"
                    value={dob}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setDob(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full rounded-xl border bg-memory-bg px-5 py-4 text-[16px] text-memory-primary outline-none transition-all duration-300 shadow-2xs border-memory-border focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="subject-dod"
                      className="text-xs uppercase tracking-widest font-bold text-memory-primary/70"
                    >
                      Date of Passing
                      {!isAlive && (
                        <span
                          aria-hidden="true"
                          className="ml-1 text-memory-required"
                        >
                          *
                        </span>
                      )}
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-memory-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAlive}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setIsAlive(e.target.checked);

                          if (e.target.checked) setDod("");

                          if (errorMessage) setErrorMessage(null);
                        }}
                        className="w-4 h-4 rounded border-memory-border text-memory-primary accent-memory-primary cursor-pointer"
                      />

                      <span>Still with us</span>
                    </label>
                  </div>

                  <input
                    id="subject-dod"
                    type="date"
                    value={dod}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setDod(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isAlive}
                    className={`w-full rounded-xl border px-5 py-4 text-[16px] shadow-2xs transition ${
                      isAlive
                        ? "bg-memory-card border-memory-border text-memory-muted opacity-60 cursor-not-allowed"
                        : "bg-memory-bg border-memory-border text-memory-primary focus:border-memory-accent focus:ring-2 focus:ring-memory-accent/20 cursor-pointer"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Final Submit Button */}
            <motion.button
              type="button"
              onClick={handleFinalSubmit}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-2 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md bg-memory-primary text-memory-light hover:bg-memory-maroon shadow-memory-primary/10"
            >
              Continue to Memory
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}