"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { readStorage } from "@/lib/storage";
import { HeaderTitleSection } from "./HeaderTitleSection";
import { HeaderActionsSection } from "./HeaderActionsSection";

interface DashboardHeaderProps {
  memoirId?: string;
  name: string;
  setName: (name: string) => void;
  dates: string;
  setDates: (dates: string) => void;
  handleCopyLink: () => void;
  isLinkCopied: boolean;
  pdfFileName: string;
  setPdfFileName: (val: string) => void;
  triggerExport: (name: string) => void;
  isExporting: boolean;
  onPublish?: () => void;
}

export function DashboardHeader({
  memoirId,
  name,
  setName,
  dates,
  setDates,
  handleCopyLink,
  isLinkCopied,
  pdfFileName,
  setPdfFileName,
  triggerExport,
  isExporting,
}: DashboardHeaderProps) {
  const router = useRouter();
  const params = useParams();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Resolve active Memoir ID safely using exactly how auth/hooks.ts stores it
  const resolveActiveMemoirId = (): string => {
    if (memoirId && memoirId !== "undefined" && memoirId !== "null") {
      return memoirId;
    }
    const paramId = params?.id || params?.memoirId;
    if (typeof paramId === "string" && paramId !== "undefined" && paramId !== "null") {
      return paramId;
    }
    
    if (typeof window !== "undefined") {
      // FETCH JUST LIKE LOGIN HOOK SAVES IT
      const storedMemoir = readStorage<{ id?: string }>("active_memoir");
      if (storedMemoir?.id) {
        return storedMemoir.id;
      }

      // Fallback to URL extraction
      const segments = window.location.pathname.split("/").filter(Boolean);
      const found = segments.find(
        (seg) => seg && seg.length > 10 && seg !== "dashboard" && seg !== "memoirs"
      );
      if (found) return found;
    }
    return "";
  };

  const handlePublish = async () => {
    const validId = resolveActiveMemoirId();

    if (!validId) {
      console.error("Critical: Memoir ID could not be found.");
      setIsPublishing(false);
      setShowConfirm(false);
      return;
    }

    try {
      setIsPublishing(true);
      await api.publishMemoir(validId);
      router.push(`/memoirs/${validId}/published`);
    } catch (error) {
      console.error("Failed to publish memoir:", error);
      setIsPublishing(false);
    }
  };

  return (
    <>
      <header className="w-full border-b border-stone-400/80 bg-memory-bg/80 backdrop-blur-sm px-8 py-5 flex items-center justify-between sticky top-0 z-30">
        <HeaderTitleSection
          name={name}
          setName={setName}
          dates={dates}
          setDates={setDates}
        />

        <div className="flex items-center gap-4">
          <HeaderActionsSection
            handleCopyLink={handleCopyLink}
            isLinkCopied={isLinkCopied}
            pdfFileName={pdfFileName}
            setPdfFileName={setPdfFileName}
            triggerExport={triggerExport}
            isExporting={isExporting}
            onPublish={() => setShowConfirm(true)} 
          />
        </div>
      </header>

      <div className="w-full flex items-center justify-center py-2 px-12">
        <div className="w-full h-0.5 bg-stone-500 animate-smooth-pulse rounded-full"></div>
      </div>

      {/* Empathetic Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4">
          <div className="bg-[#FAF9F6] border border-stone-200 p-8 max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-serif italic text-memory-maroon mb-4">
              Finalize this Memoir?
            </h3>
            <p className="text-stone-600 font-serif text-[15px] leading-relaxed mb-6">
              Publishing is permanent and cannot be reversed. All edits will be
              locked, and the story will be woven into its final, cinematic form
              for your family to read and reflect upon. Are you ready?
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-stone-500 font-serif italic text-sm hover:text-stone-800 cursor-pointer"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-memory-maroon text-white px-5 py-2 rounded-sm font-sans text-[11px] uppercase tracking-wider font-semibold shadow-sm hover:bg-stone-800 transition cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : "Yes, Publish Memoir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}