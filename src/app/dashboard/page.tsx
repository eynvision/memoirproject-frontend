"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // 1. IMPORT ROUTER
import { useExportMemoir } from "@/hooks/useExportMemoir";

// Modular Imports
import { BookCoverExperience } from "@/features/dashboard/components/BookCoverExperience";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { MemoryInputSection } from "@/features/dashboard/components/MemoryInputSection";
import { MemoryArchive } from "@/features/dashboard/components/MemoryArchive";
import { ContributorsOverlay } from "@/features/dashboard/components/ContributorsOverlay";
import { ArchiveChatWidget } from "@/features/dashboard/components/ArchiveChatWidget";
import { ShareModal } from "@/features/dashboard/components/ShareModal";

// Custom Hooks
import { useCaptureMemory } from "@/hooks/useCaptureMemory";
import { useMemoirFeed } from "@/hooks/useMemoirFeed";
import { readStorage } from "@/lib/storage";
import { useMemoirActions } from "@/hooks/useMemoirActions";

export default function OwnerDashboard() {
  const router = useRouter(); // 2. INITIALIZE ROUTER
  
  const [memoirId, setMemoirId] = useState<string>("");
  const [name, setName] = useState("");
  const [dates, setDates] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const [activeInput, setActiveInput] = useState<
    "none" | "text" | "audio" | "media" | "combined"
  >("none");
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const [pdfFileName, setPdfFileName] = useState("My_Memoir");
  
  const { triggerExport, isExporting } = useExportMemoir(memoirId);
  const [showContributors, setShowContributors] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const user =
          readStorage<{ name?: string; fullName?: string }>("user_profile") ??
          readStorage<{ name?: string; fullName?: string }>("user_name");
        if (user) {
          setOwnerName(user.name || user.fullName || "");
        }
      } catch (e) {
        console.error("Failed to load user profile", e);
      }

      try {
        const stored = readStorage<{
          id?: string;
          subject_name?: string;
          subject_born_on?: string;
          subject_is_living?: boolean;
          subject_died_on?: string;
          data?: Record<string, unknown>;
        }>("active_memoir");
        const data = (stored?.data as typeof stored | undefined) || stored;

        if (data?.id) setMemoirId(data.id);

        setName(data?.subject_name || "My Memoir");

        const dobYear = data?.subject_born_on
          ? new Date(data.subject_born_on).getFullYear().toString()
          : "";

        let dodYear = "";
        if (data?.subject_is_living) {
          dodYear = "Present";
        } else if (data?.subject_died_on) {
          dodYear = new Date(data.subject_died_on).getFullYear().toString();
        }

        if (dobYear) {
          setDates(`${dobYear} — ${dodYear || "?"}`);
        } else {
          setDates("");
        }
      } catch (e) {
        console.error("Could not resolve active_memoir from localStorage", e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const {
    memories,
    loading: feedLoading,
    error: feedError,
    refreshFeed,
    setMemories,
  } = useMemoirFeed(memoirId);

  // Extracted business logic & actions hook
  const {
    chapters,
    isGeneratingChapters,
    isShareModalOpen,
    setIsShareModalOpen,
    currentShareUrl,
    isLinkCopied,
    handleOpenShareModal,
    handleSavePasswordAndCopy,
    handleGenerateTimeline,
    handleRenameChapter,
    handleUpdateWovenText,
  } = useMemoirActions(memoirId, refreshFeed, setMemories);

  const {
    draft,
    setDraft,
    photoFile,
    setPhotoFile,
    recording,
    audioUrl,
    loading: isAssembling,
    error,
    successMsg,
    startRecording,
    stopRecording,
    clearRecording,
    handleSubmit,
  } = useCaptureMemory(memoirId, () => {
    setActiveInput("none");
    setIsTextExpanded(false);
    refreshFeed();
  });

  const toggleStack = (kind: string) => {
    setExpandedStacks((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
    );
  };

  // 3. CREATE THE PUBLISH HANDLER
  const handlePublish = () => {
    if (!memoirId) return;
    router.push(`/memoirs/${memoirId}/published`);
  };

  return (
    <BookCoverExperience userName={ownerName || "Author"}>
      <div className="min-h-screen bg-memory-bg text-stone-900 font-sans selection:bg-memory-primary/20 flex overflow-x-hidden relative">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .book-text { hyphens: auto; -webkit-hyphens: auto; -ms-hyphens: auto; }
          @keyframes smoothPulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.85; } }
          .animate-smooth-pulse { animation: smoothPulse 4s ease-in-out infinite; }
        `,
          }}
        />

        <AnimatePresence>
          {activeInput !== "none" && (
            <motion.div
              key="focus-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-memory-bg/92 backdrop-blur-md z-40 pointer-events-auto"
            />
          )}
        </AnimatePresence>

        <ContributorsOverlay
          showContributors={showContributors}
          setShowContributors={setShowContributors}
          contributors={Array.from(
            new Set(memories.map((m) => m.author || "Owner")),
          )}
        />
        <DashboardSidebar setShowContributors={setShowContributors} />

        <main className="flex-1 flex flex-col min-h-screen pb-32">
          <DashboardHeader
            name={name}
            setName={setName}
            dates={dates}
            setDates={setDates}
            handleCopyLink={handleOpenShareModal}
            isLinkCopied={isLinkCopied}
            pdfFileName={pdfFileName}
            setPdfFileName={setPdfFileName}
            triggerExport={triggerExport}
            isExporting={isExporting}
            onPublish={handlePublish} 
          />

          <div className="max-w-3xl mx-auto w-full px-6 pt-10">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                {successMsg}
              </div>
            )}

            <MemoryInputSection
              activeInput={activeInput}
              setActiveInput={setActiveInput}
              isTextExpanded={isTextExpanded}
              setIsTextExpanded={setIsTextExpanded}
              isAssembling={isAssembling}
              inputTitle={draft.title}
              setInputTitle={(val) => setDraft({ ...draft, title: val })}
              inputDate={draft.occurred_start || ""}
              setInputDate={(val) =>
                setDraft({ ...draft, occurred_start: val })
              }
              inputContent={draft.body_text || ""}
              setInputContent={(val) => setDraft({ ...draft, body_text: val })}
              photoFile={photoFile}
              setPhotoFile={setPhotoFile}
              recording={recording}
              audioUrl={audioUrl}
              startRecording={startRecording}
              stopRecording={stopRecording}
              clearRecording={clearRecording}
              handleLocalSubmit={handleSubmit}
            />

            {feedLoading && !memories.length ? (
              <div className="py-24 text-center text-memory-muted text-sm tracking-widest uppercase animate-pulse">
                Unpacking Archive...
              </div>
            ) : feedError ? (
              <div className="py-24 text-center text-red-600 text-sm font-medium">
                Failed to load archive: {feedError}
              </div>
            ) : (
              <MemoryArchive
                expandedStacks={expandedStacks}
                toggleStack={toggleStack}
                mockMemories={
                  memories as React.ComponentProps<
                    typeof MemoryArchive
                  >["mockMemories"]
                }
                chapters={chapters}
                memoirId={memoirId}
                isGenerating={isGeneratingChapters}
                onGenerateTimeline={handleGenerateTimeline}
                onRenameChapter={handleRenameChapter}
                onUpdateWovenText={handleUpdateWovenText}
              />
            )}
          </div>
        </main>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={currentShareUrl}
          onSaveAndCopy={handleSavePasswordAndCopy}
          isLinkCopied={isLinkCopied}
        />

        {memoirId && <ArchiveChatWidget memoirId={memoirId} />}
      </div>
    </BookCoverExperience>
  );
}