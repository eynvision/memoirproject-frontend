// cspell:disable
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useExportMemoir } from "@/hooks/useExportMemoir";
import { api, CommentEntity, ChapterEntity } from "@/lib/api/client";

// Custom Components
import MemoirHeader from "@/features/FinalMemoir/MemoirHeader";
import MemoirHero from "@/features/FinalMemoir/MemoirHero";
import MemoirActionBar from "@/features/FinalMemoir/MemoirActionBar";
import MemoryCard from "@/features/FinalMemoir/MemoryCard";
import MemoirSidebar from "@/features/FinalMemoir/MemoirSidebar";
import ScatteredGallery from "@/features/FinalMemoir/ScatteredGallery";
import { MemoryItem } from "@/features/FinalMemoir/types";

// Mock Data
import { mockHeroPhotos, mockMemories, mockShortQuotes } from "@/features/FinalMemoir/mockData";

// Maps real published chapters (nested memories) into the flat MemoryItem
// shape the existing timeline/chapter rendering already expects.
function chaptersToMemoryItems(chapters: ChapterEntity[]): MemoryItem[] {
  return chapters
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((chapter) =>
      chapter.memories.map((memory) => ({
        id: memory.id,
        author: "Family",
        title: memory.title ?? undefined,
        text: memory.body_text ?? "",
        reactionsCount: 0,
        chapter: chapter.title,
        chapterSubtitle: chapter.subtitle ?? undefined,
        date: memory.occurred_start ?? "",
      }))
    );
}

interface ReplyItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
  replies?: ReplyItem[];
}

export default function FinalMemoirPage() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeView, setActiveView] = useState<"timeline" | "chapters">("timeline");
  
  const [showScatteredView, setShowScatteredView] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [pdfFileName, setPdfFileName] = useState("nadias-story");
  const [isTurningPage] = useState(false);
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Strict typing for comments map without any 'any' types
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  
  const [memories, setMemories] = useState<MemoryItem[]>(mockMemories);

  const [reactions, setReactions] = useState<Record<string, { count: number; reacted: boolean }>>(() => {
    const initial: Record<string, { count: number; reacted: boolean }> = {};
    mockMemories.forEach(m => {
      initial[m.id] = { count: m.reactionsCount, reacted: false };
    });
    return initial;
  });

  const [memoirId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const savedMemoir = localStorage.getItem("active_memoir");
      if (savedMemoir) {
        const parsed = JSON.parse(savedMemoir);
        return parsed.data?.id || parsed.id || "";
      }
    } catch (err) {
      console.error("Failed to parse active memoir from localStorage", err);
    }
    return "";
  });

  const { triggerExport, isExporting } = useExportMemoir(memoirId);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Helper to check if an ID is a valid database UUID
  const isValidUuid = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Load the real published chapters/memories once we have a real memoir id.
  // Falls back to the mock data (already the initial state) when there is
  // none yet, or when the memoir hasn't been published through the new
  // preview/publish flow.
  useEffect(() => {
    if (!isValidUuid(memoirId)) return;

    api.getChapters(memoirId, "published")
      .then((chapters) => {
        if (chapters.length === 0) return;
        const realMemories = chaptersToMemoryItems(chapters);
        setMemories(realMemories);
        setReactions(
          realMemories.reduce<Record<string, { count: number; reacted: boolean }>>((acc, m) => {
            acc[m.id] = { count: m.reactionsCount, reacted: false };
            return acc;
          }, {})
        );
      })
      .catch((err) => console.error("Failed to load published chapters:", err));
  }, [memoirId]);

  // Helper to format flat backend comment entities into nested reply trees
  const formatCommentsToTree = (entities: CommentEntity[]): CommentItem[] => {
    const commentMap = new Map<string, CommentItem>();
    const rootComments: CommentItem[] = [];

    entities.forEach((entity) => {
      const item: CommentItem = {
        id: entity.id,
        author: entity.author_name || "Participant",
        text: entity.body,
        time: new Date(entity.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        replies: [],
      };
      commentMap.set(entity.id, item);
    });

    entities.forEach((entity) => {
      const item = commentMap.get(entity.id);
      if (!item) return;

      if (entity.parent_comment_id && commentMap.has(entity.parent_comment_id)) {
        const parent = commentMap.get(entity.parent_comment_id);
        if (parent && parent.replies) {
          parent.replies.push({
            id: item.id,
            author: item.author,
            text: item.text,
            time: item.time,
          });
        }
      } else {
        rootComments.push(item);
      }
    });

    return rootComments;
  };

  // Safe useEffect without synchronous state updates during effect execution
  useEffect(() => {
    if (openCommentsId && !commentsMap[openCommentsId]) {
      if (!isValidUuid(openCommentsId)) {
        return;
      }

      api.getComments(openCommentsId)
        .then((data: CommentEntity[]) => {
          const formatted = formatCommentsToTree(data);
          setCommentsMap((prev) => ({ ...prev, [openCommentsId]: formatted }));
        })
        .catch((err) => console.error("Failed to load comments:", err));
    }
  }, [openCommentsId, commentsMap]);

  const handleToggleReaction = (id: string) => {
    setReactions((prev) => {
      const current = prev[id] || { count: 0, reacted: false };
      const nextReacted = !current.reacted;
      return {
        ...prev,
        [id]: { count: nextReacted ? current.count + 1 : current.count - 1, reacted: nextReacted },
      };
    });
  };

  const handlePostComment = async (id: string) => {
    const text = commentInputs[id];
    if (!text || !text.trim()) return;

    if (!isValidUuid(id)) {
      const fallbackComment: CommentItem = { 
        id: Date.now().toString(), 
        author: "You", 
        text: text.trim(), 
        time: "Just now", 
        replies: [] 
      };
      setCommentsMap((prev) => ({ ...prev, [id]: [...(prev[id] || []), fallbackComment] }));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      return;
    }

    try {
      const newComment = await api.createComment({
        memoir_id: memoirId || "mock-memoir-id",
        memory_id: id,
        body: text.trim(),
      });

      const formattedComment: CommentItem = {
        id: newComment.id,
        author: newComment.author_name || "You",
        text: newComment.body,
        time: new Date(newComment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        replies: [],
      };

      setCommentsMap((prev) => ({ 
        ...prev, 
        [id]: [...(prev[id] || []), formattedComment] 
      }));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handlePostReply = async (memoryId: string, commentId: string, replyText: string) => {
    if (!replyText || !replyText.trim()) return;

    if (!isValidUuid(memoryId)) {
      setCommentsMap((prev) => {
        const memoryComments = prev[memoryId] || [];
        const updated = memoryComments.map((c) => {
          if (c.id === commentId) {
            const replyItem: ReplyItem = { 
              id: Date.now().toString(), 
              author: "You", 
              text: replyText.trim(), 
              time: "Just now" 
            };
            return {
              ...c,
              replies: [...(c.replies || []), replyItem]
            };
          }
          return c;
        });
        return { ...prev, [memoryId]: updated };
      });
      return;
    }

    try {
      const newReply = await api.createComment({
        memoir_id: memoirId || "mock-memoir-id",
        memory_id: memoryId,
        parent_comment_id: commentId,
        body: replyText.trim(),
      });

      setCommentsMap((prev) => {
        const memoryComments = prev[memoryId] || [];
        const updated = memoryComments.map((c) => {
          if (c.id === commentId) {
            const replyItem: ReplyItem = {
              id: newReply.id,
              author: newReply.author_name || "You",
              text: newReply.body,
              time: new Date(newReply.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            return {
              ...c,
              replies: [...(c.replies || []), replyItem]
            };
          }
          return c;
        });
        return { ...prev, [memoryId]: updated };
      });
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const handleSearchTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 250);
  };

  const filteredMemories = memories.filter((mem) => {
    const matchesSearch =
      searchQuery === "" ||
      mem.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mem.imageCaption && mem.imageCaption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mem.title && mem.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const uniqueChapters = Array.from(new Set(memories.map(m => m.chapter)));

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-serif text-stone-900 selection:bg-memory-maroon/20">
      
      <style dangerouslySetInnerHTML={{ __html: `
        .font-serif { font-family: "Times New Roman", Times, serif !important; }
        .book-text { hyphens: auto; -webkit-hyphens: auto; -ms-hyphens: auto; }
        @keyframes scribble {
          0% { transform: rotate(-12deg) translate(0px, 0px); }
          25% { transform: rotate(-16deg) translate(-1px, 2px); }
          50% { transform: rotate(-8deg) translate(2px, -1px); }
          75% { transform: rotate(-14deg) translate(-1px, 1px); }
          100% { transform: rotate(-12deg) translate(0px, 0px); }
        }
        .animate-scribble { animation: scribble 0.2s infinite; }
        .cursor-blink::after { content: '|'; animation: blink 1s step-start infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .clearfix::after { content: ""; clear: both; display: table; }
      `}} />

      <MemoirHeader isVisible={isVisible} />

      <MemoirHero onOpenGallery={() => setShowScatteredView(true)} />

      <div className="max-w-4xl mx-auto px-6 mb-8 flex flex-col gap-0.5 opacity-60">
        <div className="w-full h-[1px] bg-stone-300"></div>
        <div className="w-full h-[1px] bg-stone-300"></div>
      </div>

      <MemoirActionBar 
        pdfFileName={pdfFileName}
        setPdfFileName={setPdfFileName}
        triggerExport={triggerExport}
        isExporting={isExporting}
        searchQuery={searchQuery}
        handleSearchTyping={handleSearchTyping}
        isTyping={isTyping}
      />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row px-6 md:px-10 py-4 gap-8 md:gap-12">
        <main style={{ perspective: "2500px" }} className="flex-1 max-w-3xl">
          <div 
            className={`relative bg-[#FCFBF8] border border-stone-200/80 px-6 md:px-10 py-6 rounded-sm pb-16 origin-left overflow-hidden ${
              isTurningPage 
                ? "transition-all duration-700 ease-[cubic-bezier(0.645,0.045,0.355,1)] opacity-0 [transform:rotateY(-130deg)_rotateX(4deg)_scale(0.95)] shadow-2xl brightness-50" 
                : "transition-opacity duration-500 ease-in opacity-100 [transform:rotateY(0deg)_rotateX(0deg)_scale(1)] shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_0_60px_rgba(90,24,39,0.02)] brightness-100"
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-black/5 via-black/0 to-transparent pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-black/5 via-transparent to-transparent pointer-events-none" style={{ clipPath: 'polygon(0 100%, 0 0, 100% 100%)' }} />

            {filteredMemories.length === 0 ? (
              <div className="py-16 text-center text-stone-400 font-serif italic">
                No entries found matching your criteria.
              </div>
            ) : (
              uniqueChapters.map((chapterName) => {
                const chapterMemories = filteredMemories.filter(m => m.chapter === chapterName);
                if (chapterMemories.length === 0) return null;
                const chapterSub = chapterMemories[0].chapterSubtitle;

                return (
                  <div key={chapterName} className="mb-8">
                    <div className="mb-3 mt-4 text-left relative flex flex-col">
                      <div className="w-full h-[2px] bg-stone-800 mb-3"></div>
                      <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-1 leading-tight">
                        {chapterName}
                      </h2>
                      {chapterSub && (
                        <p className="text-[14px] font-serif italic text-stone-500 mb-3">
                          {chapterSub}
                        </p>
                      )}
                    </div>

                    {chapterMemories.map((mem) => (
                      <MemoryCard 
                        key={mem.id}
                        mem={mem}
                        isHighlighted={mem.reactionsCount > 20}
                        currentReaction={reactions[mem.id] || { count: mem.reactionsCount, reacted: false }}
                        handleToggleReaction={handleToggleReaction}
                        isCommentsOpen={openCommentsId === mem.id}
                        setOpenCommentsId={setOpenCommentsId}
                        commentsList={commentsMap[mem.id] || []}
                        commentInputValue={commentInputs[mem.id] || ""}
                        setCommentInputValue={(val) => setCommentInputs({ ...commentInputs, [mem.id]: val })}
                        handlePostComment={handlePostComment}
                        handlePostReply={(commentId, replyText) => handlePostReply(mem.id, commentId, replyText)}
                      />
                    ))}
                  </div>
                );
              })
            )}

            {filteredMemories.length > 0 && (
              <div className="mt-16 flex flex-col items-center justify-center opacity-90 pb-8">
                <div 
                  className="relative w-20 h-20 bg-memory-maroon flex items-center justify-center cursor-default group"
                  style={{
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 3px 8px rgba(255,255,255,0.2)",
                    borderRadius: "50% 48% 52% 49% / 49% 51% 48% 52%"
                  }}
                >
                  <div className="absolute -top-1 right-2 w-3 h-3 rounded-full bg-memory-maroon shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]"></div>
                  <div className="absolute bottom-1 -left-1 w-4 h-3 rounded-full bg-memory-maroon shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)]"></div>
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] bg-memory-maroon/50">
                    <span className="font-serif text-white/80 text-3xl italic font-bold select-none">N</span>
                  </div>
                </div>
                
                <div className="mt-8 text-center border-t border-stone-200/60 pt-6 flex flex-col items-center">
                  <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 mb-4 font-semibold">
                    Sealed & Shared By
                  </p>
                  <p className="text-[16px] md:text-[18px] font-serif italic text-stone-600 max-w-lg leading-loose px-4">
                    Sarah, Amir, Uncle Tariq, Aunt Salma, Elena, Daniel, Leila, and Marcus.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        <MemoirSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          mockShortQuotes={mockShortQuotes}
          chapters={uniqueChapters}
        />
      </div>

      {showScatteredView && (
        <ScatteredGallery 
          heroPhotos={mockHeroPhotos} 
          onClose={() => setShowScatteredView(false)} 
        />
      )}
    </div>
  );
}