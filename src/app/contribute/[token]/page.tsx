/**
 * @file page.tsx
 * @description Contributor page with Name & Password gatekeeper wrapping the existing Archive UI.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { api, parseErrorDetail } from "@/lib/api/client";

// reusing your existing components
import { BookCoverExperience } from "@/features/dashboard/components/BookCoverExperience";
import { MemoryArchive } from "@/features/dashboard/components/MemoryArchive";
import { normalizeMemory } from "@/lib/validations/memory";

interface MemoirMemory {
  id: string;
  title?: string;
  body_text?: string;
  author_name?: string;
  [key: string]: unknown;
}

interface MemoirData {
  id?: string;
  memoir_id?: string;
  requires_password?: boolean;
  memories?: MemoirMemory[];
  [key: string]: unknown;
}

export default function ContributorPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gatekeeper state
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [contributorName, setContributorName] = useState("");
  const [password, setPassword] = useState("");

  const [memoirData, setMemoirData] = useState<MemoirData | null>(null);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);

  // 1. Initial check when landing on the share token link
  useEffect(() => {
    if (!token) return;

    const checkSharedMemoir = async () => {
      try {
        const data = await api.getSharedMemoir(token);
        const resolvedData = (data as { data?: MemoirData }).data || (data as MemoirData);

        // If backend flags that a password is required
        if (resolvedData.requires_password) {
          setRequiresPassword(true);
          setLoading(false);
        } else {
          // Public link, no password needed
          setMemoirData(resolvedData);
          setIsUnlocked(true);
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load the memoir.",
        );
        setLoading(false);
      }
    };

    checkSharedMemoir();
  }, [token]);

  // 2. Handle Name + Password Verification Submission
  const handleVerifyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName.trim()) {
      setError("Please enter your name so your contributions can be credited.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/api/share/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password || "",
          contributor_name: contributorName.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          parseErrorDetail(json, "Incorrect password or invalid access."),
        );
      }

      const verifiedData = json.data || json;
      setMemoirData(verifiedData);
      setIsUnlocked(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Access verification failed.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleStack = (kind: string) => {
    setExpandedStacks((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-memory-bg flex items-center justify-center">
        <p className="text-memory-muted tracking-widest uppercase animate-pulse text-sm font-sans">
          Opening Archive...
        </p>
      </div>
    );
  }

  // If link is invalid, expired, or generic error occurs before unlock
  if (error && !isUnlocked && !requiresPassword) {
    return (
      <div className="min-h-screen bg-memory-bg flex flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <h1 className="text-2xl text-stone-900 font-bold">Link Unavailable</h1>
        <p className="text-stone-600 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  // 3. GATEKEEPER VIEW: Prompt for Name & Password if locked
  if (!isUnlocked) {
    return (
      <section className="min-h-screen bg-memory-bg text-memory-primary flex items-center justify-center px-6 py-16 relative z-10 font-sans selection:bg-memory-primary selection:text-white">
        <div className="w-full max-w-md bg-white border border-stone-300 rounded-3xl px-8 py-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-memory-bg border border-stone-200 flex items-center justify-center mx-auto mb-4 text-memory-primary shadow-2xs">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl text-memory-primary leading-tight font-bold mb-2">
              Protected Archive
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed">
              Please enter your name and the shared access password to view and
              contribute.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyAccess} className="space-y-5">
            <div>
              <label
                htmlFor="contributor-name"
                className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  id="contributor-name"
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="e.g. Uncle Ahmed"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-800 outline-none focus:border-memory-primary transition-all font-sans"
                />
              </div>
            </div>

            {requiresPassword && (
              <div>
                <label
                  htmlFor="access-password"
                  className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-2"
                >
                  Access Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    id="access-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter share password"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-800 outline-none focus:border-memory-primary transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isVerifying}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-4 py-4 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-md bg-memory-primary text-white hover:bg-memory-maroon flex items-center justify-center gap-2"
            >
              {isVerifying ? "Verifying..." : "Enter Archive"}{" "}
              <ArrowRight size={16} />
            </motion.button>
          </form>
        </div>
      </section>
    );
  }

  // 4. UNLOCKED VIEW: Wrap with Memory Input capability
  return (
    <BookCoverExperience userName={contributorName || "Contributor"}>
      <div className="min-h-screen bg-memory-bg text-stone-900 font-sans flex flex-col items-center pt-16 pb-32">
        <header className="mb-12 text-center px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-memory-primary mb-3 tracking-tight">
            Family Memoir Archive
          </h1>
          <p className="text-stone-600 tracking-[0.15em] uppercase text-xs font-bold">
            Contributing as{" "}
            <span className="text-memory-maroon font-extrabold">
              {contributorName}
            </span>
          </p>
        </header>

        <main className="max-w-3xl w-full px-6 space-y-12">
          {/* Allow contributors to submit a memory */}
          <div className="bg-white border border-stone-300 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-4 font-sans">
              Add Your Memory
            </h2>
            <p className="text-stone-600 text-sm mb-6 font-serif italic">
              Share a story, a quote, or a photograph to help keep this history
              alive.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const titleInput = form.elements.namedItem(
                  "title",
                ) as HTMLInputElement;
                const bodyInput = form.elements.namedItem(
                  "body_text",
                ) as HTMLTextAreaElement;

                if (!memoirData) return;

                try {
                  await api.createMemory({
                    memoir_id: (memoirData.id || memoirData.memoir_id) as string,
                    title: titleInput.value,
                    body_text: bodyInput.value,
                    occurred_start: new Date().toISOString().split("T")[0],
                    occurred_end: new Date().toISOString().split("T")[0],
                    occurred_precision: "day",
                    kind: "text",
                  });

                  window.location.reload(); // Refresh to show new memory
                } catch {
                  alert("Failed to preserve memory. Please try again.");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Summer at the lake house"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-memory-primary"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-1">
                  Your Story
                </label>
                <textarea
                  name="body_text"
                  required
                  rows={4}
                  placeholder="Write your reflection here..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-memory-primary resize-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-memory-primary text-white rounded-xl text-sm font-semibold hover:bg-memory-maroon transition cursor-pointer"
              >
                Preserve Memory
              </button>
            </form>
          </div>

          {/* Existing Archive View */}
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-6 font-sans">
              Archive Feed
            </h2>
            <MemoryArchive
              expandedStacks={expandedStacks}
              toggleStack={toggleStack}
              mockMemories={(memoirData?.memories || []).map(normalizeMemory)}
              memoirId={(memoirData?.id || memoirData?.memoir_id || "") as string}
            />
          </div>
        </main>
      </div>
    </BookCoverExperience>
  );
}