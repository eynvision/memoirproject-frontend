"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api/client";
import { Chapter } from "@/lib/validations/memory";

export function useMemoirActions(
  memoirId: string, 
  refreshFeed: () => void, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMemories?: React.Dispatch<React.SetStateAction<any[]>>
) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (timelineTimeoutRef.current) clearTimeout(timelineTimeoutRef.current);
    };
  }, []);

  // Fetch chapters on mount or memoirId change
  useEffect(() => {
    if (!memoirId) return;
    const fetchChapters = async () => {
      try {
        const data = await api.getChapters(memoirId);
        if (data) setChapters(data);
      } catch {
        setChapters([]);
      }
    };
    fetchChapters();
  }, [memoirId]);

  const handleOpenShareModal = async () => {
    if (!memoirId) return;
    try {
      const res = await api.createShareLink(memoirId);
      const linkData = res.data || res;
      if (linkData && linkData.url) {
        setCurrentShareUrl(linkData.url);
        setIsShareModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to generate share link:", error);
    }
  };

  const handleSavePasswordAndCopy = async (password: string) => {
    if (!memoirId) return;
    try {
      await api.updateShareLinkPassword(memoirId, password);
      await navigator.clipboard.writeText(currentShareUrl);
      setIsLinkCopied(true);
      copiedTimerRef.current = setTimeout(() => {
        setIsLinkCopied(false);
        setIsShareModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to save password or copy link:", error);
    }
  };

  const handleGenerateTimeline = async () => {
    if (!memoirId) return;
    setIsGeneratingChapters(true);

    try {
      await api.generateTimeline(memoirId);

      const pollInterval = setInterval(async () => {
        try {
          const freshChapters = await api.getChapters(memoirId);
          if (freshChapters && freshChapters.length > 0) {
            setChapters(freshChapters);
            setIsGeneratingChapters(false);
            clearInterval(pollInterval);
            refreshFeed();
          }
        } catch {
          // Ignore polling errors
        }
      }, 4000);

      timelineTimeoutRef.current = setTimeout(() => {
        clearInterval(pollInterval);
        setIsGeneratingChapters(false);
      }, 60000);
    } catch (e) {
      console.error("Failed to start timeline generation", e);
      setIsGeneratingChapters(false);
    }
  };

  const handleRenameChapter = async (chapterId: string, newTitle: string) => {
    if (!memoirId) return;
    try {
      await api.renameChapter(memoirId, chapterId, newTitle);
      setChapters((prev) =>
        prev.map((ch) => (ch.id === chapterId ? { ...ch, title: newTitle } : ch))
      );
    } catch (e) {
      console.error("Failed to rename chapter", e);
    }
  };

  const handleUpdateWovenText = async (memoryId: string, newText: string) => {
    if (!memoirId) return;

    if (setMemories) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMemories((prev: any[]) =>
        prev.map((m) => (m.id === memoryId ? { ...m, ai_woven_text: newText } : m))
      );
    }

    try {
      await api.updateWovenText(memoirId, memoryId, newText);
      refreshFeed();
    } catch (e) {
      console.error("Failed to update narrative text", e);
    }
  };

  return {
    chapters,
    setChapters,
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
  };
}