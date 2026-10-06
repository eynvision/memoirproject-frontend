"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import { api } from "@/lib/api/client";

import MemoirHeader from "@/features/FinalMemoir/MemoirHeader";
import MemoirHero from "@/features/FinalMemoir/MemoirHero";
import MemoryCard from "@/features/FinalMemoir/MemoryCard";
import MemoirSidebar from "@/features/FinalMemoir/MemoirSidebar";
import ScatteredGallery from "@/features/FinalMemoir/ScatteredGallery";

import { MemoryItem, HeroPhoto, MemoryImage, ShortQuote } from "@/features/FinalMemoir/types";
import { readStorage } from "@/lib/storage";

interface CommentItem { id: string; author: string; text: string; time: string; }

interface ApiMediaAsset {
  id: string;
  kind: string; 
  playback_url?: string;
  storage_key?: string;
  caption?: string;
}

interface ApiMemoryRecord {
  id: string;
  title?: string;
  body_text?: string;
  ai_woven_text?: string; 
  occurred_start?: string;
  created_at: string;
  chapter_id?: string;
  media_assets?: ApiMediaAsset[];
  author_participant_id?: string;
}

interface ApiChapterRecord {
  id: string;
  title: string;
  summary?: string;
  sort_order?: number;
}

export default function FinalMemoirPage() {
  const params = useParams();
  const memoirId = params?.id as string;

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeView, setActiveView] = useState<"timeline" | "chapters">("chapters");
  const [showScatteredView, setShowScatteredView] = useState(false);
  
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentsMap] = useState<Record<string, CommentItem[]>>({});
  const [reactions, setReactions] = useState<Record<string, { count: number; reacted: boolean }>>({});
  
  // LIVE DATA STATES
  const [liveMemories, setLiveMemories] = useState<MemoryItem[]>([]);
  const [livePhotos, setLivePhotos] = useState<HeroPhoto[]>([]);
  const [liveChaptersList, setLiveChaptersList] = useState<string[]>([]);
  const [liveDecadesList, setLiveDecadesList] = useState<string[]>([]);
  const [liveShortQuotes, setLiveShortQuotes] = useState<ShortQuote[]>([]);
  
  const [loadingFeed, setLoadingFeed] = useState<boolean>(true);
  const [subjectName, setSubjectName] = useState<string>("The Archive");
  const [memoirDescription, setMemoirDescription] = useState<string>("Preserved memories and shared stories.");
  const [dob, setDob] = useState<string>("");
  const [dod, setDod] = useState<string>("Present");

  // 1. Fetch Live Data
  useEffect(() => {
    if (!memoirId) {
      const t = setTimeout(() => setLoadingFeed(false), 0);
      return () => clearTimeout(t);
    }

    async function fetchLiveMemoirData() {
      try {
        setLoadingFeed(true);
        
        // Use the actual API functions from your client.ts
        const [chaptersData, memoriesData] = await Promise.all([
          api.getChapters(memoirId).catch(() => []) as Promise<ApiChapterRecord[]>,
          api.getMemoirFeed(memoirId).catch(() => []) as Promise<ApiMemoryRecord[]>
        ]);

        // Get basic memoir info from localStorage just like the Dashboard does
        const stored = readStorage<{
          subject_name?: string;
          description?: string;
          subject_born_on?: string;
          subject_died_on?: string;
          subject_is_living?: boolean;
          data?: Record<string, unknown>;
        }>("active_memoir");
        const data = (stored?.data as typeof stored | undefined) || stored;
        if (data?.subject_name) setSubjectName(data.subject_name);
        if (data?.description) setMemoirDescription(data.description);
        if (data?.subject_born_on) setDob(new Date(data.subject_born_on).getFullYear().toString());
        if (data?.subject_died_on) {
          setDod(new Date(data.subject_died_on).getFullYear().toString());
        } else if (data?.subject_is_living) {
          setDod("Present");
        }

        const chapterMap: Record<string, { title: string; summary: string }> = {};
        const chapterOrderList: string[] = [];

        if (Array.isArray(chaptersData)) {
          chaptersData.forEach((ch: ApiChapterRecord) => {
            chapterMap[ch.id] = { title: ch.title, summary: ch.summary || "" };
            chapterOrderList.push(ch.title);
          });
        }

        setLiveChaptersList(chapterOrderList);

        if (Array.isArray(memoriesData) && memoriesData.length > 0) {
          const photosExtracted: HeroPhoto[] = [];
          const shortQuotesExtracted: ShortQuote[] = [];
          const decadeSet = new Set<string>();

          const mapped: MemoryItem[] = memoriesData.map((record: ApiMemoryRecord) => {
            const photoAssets = record.media_assets?.filter((m: ApiMediaAsset) => m.kind === "photo") || [];
            const audioAssets = record.media_assets?.filter((m: ApiMediaAsset) => m.kind === "audio") || [];

            const resolveMediaUrl = (asset: ApiMediaAsset): string => {
              if (asset.playback_url) return asset.playback_url;
              if (asset.storage_key) {
                const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
                const cleanKey = asset.storage_key.replace(/^\/+/, "");
                return baseUrl ? `${baseUrl}/storage/v1/object/public/memoir-media/${cleanKey}` : "";
              }
              return "";
            };

            const images: MemoryImage[] = photoAssets.map((asset: ApiMediaAsset) => ({
              id: asset.id,
              url: resolveMediaUrl(asset),
              caption: asset.caption || record.title || "Archive photo",
            })).filter((img: MemoryImage) => Boolean(img.url));

            const audioUrls = audioAssets.map((a: ApiMediaAsset) => resolveMediaUrl(a)).filter(Boolean);
            
            images.forEach((img: MemoryImage) => {
              photosExtracted.push({ 
                id: img.id, 
                url: img.url, 
                caption: img.caption || record.title || "Archive photo" 
              });
            });

            const rawDate = record.occurred_start || record.created_at;
            if (rawDate) {
              const year = new Date(rawDate).getFullYear();
              if (!isNaN(year)) decadeSet.add(`${Math.floor(year / 10) * 10}s`);
            }

            const formattedDate = record.occurred_start
              ? new Date(record.occurred_start).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
              : new Date(record.created_at).toLocaleDateString();

            const assignedChapterInfo = record.chapter_id && chapterMap[record.chapter_id]
                ? chapterMap[record.chapter_id]
                : { title: "Uncategorized Archives", summary: "" };

            const finalText = record.ai_woven_text || record.body_text || "";

            // Smart Fleeting Thoughts Extractor
            if (images.length === 0 && audioUrls.length === 0 && finalText.length > 10) {
              const firstDot = finalText.indexOf('.');
              let snippet = finalText;
              
              if (firstDot > 10 && firstDot < 120) {
                snippet = finalText.substring(0, firstDot + 1);
              } else if (finalText.length > 120) {
                snippet = finalText.substring(0, 117).trim() + "...";
              }
              
              shortQuotesExtracted.push({ 
                id: record.id, 
                author: "Archive Snapshot", 
                text: snippet 
              });
            }

            return {
              id: record.id,
              author: "Family Member",
              title: record.title || "",
              text: finalText,
              reactionsCount: 0,
              images: images.length > 0 ? images : undefined,
              audioUrls: audioUrls.length > 0 ? audioUrls : undefined,
              chapter: assignedChapterInfo.title,
              chapterSubtitle: assignedChapterInfo.summary,
              date: formattedDate,
            };
          });

          setLiveMemories(mapped);
          setLivePhotos(photosExtracted);
          setLiveShortQuotes(shortQuotesExtracted.slice(0, 6)); 
          setLiveDecadesList(Array.from(decadeSet).sort());
        }
      } catch (err) {
        console.error("Failed to fetch live memoir details:", err);
      } finally {
        setLoadingFeed(false);
      }
    }

    fetchLiveMemoirData();
  }, [memoirId]);

  // 2. Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100));
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleToggleReaction = (id: string) => {
    setReactions((prev) => {
      const current = prev[id] || { count: 0, reacted: false };
      const nextReacted = !current.reacted;
      return { ...prev, [id]: { count: nextReacted ? current.count + 1 : current.count - 1, reacted: nextReacted } };
    });
  };

  const uniqueChapters = liveChaptersList.length > 0 
    ? liveChaptersList 
    : Array.from(new Set(liveMemories.map((m) => m.chapter)));

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-serif text-stone-900 selection:bg-memory-maroon/20">
      <MemoirHeader isVisible={isVisible} />

      <MemoirHero
        onOpenGallery={() => setShowScatteredView(true)}
        name={subjectName}
        description={memoirDescription}
        dates={dob ? `${dob} — ${dod}` : ""}
        heroPhotos={livePhotos} 
      />

      <div className="max-w-4xl mx-auto px-6 mb-8 flex flex-col gap-0.5 opacity-60">
        <div className="w-full h-[1px] bg-stone-300"></div>
        <div className="w-full h-[1px] bg-stone-300"></div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row px-6 md:px-10 py-4 gap-8 md:gap-12">
        <main className="flex-1 max-w-3xl">
          <div
            className="relative bg-[#FCFBF8] border border-stone-200/80 px-6 md:px-10 py-6 rounded-sm pb-16 shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_0_60px_rgba(90,24,39,0.02)]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")` }}
          >
            {loadingFeed ? (
              <div className="py-20 text-center text-stone-400 font-serif italic">
                Opening the archive pages...
              </div>
            ) : liveMemories.length === 0 ? (
              <div className="py-16 text-center text-stone-400 font-serif italic">
                No entries found in this archive. Return to the dashboard to organize memories.
              </div>
            ) : (
              uniqueChapters.map((chapterName, chapterIdx) => {
                const chapterMemories = liveMemories.filter((m) => m.chapter === chapterName);
                if (chapterMemories.length === 0) return null;

                const chapterSub = chapterMemories[0].chapterSubtitle;
                const chapterAnchorId = `chapter-${chapterIdx}`;

                return (
                  <div key={chapterAnchorId} className="mb-20">
                    
                    {/* Chapter Header */}
                    <div className="mb-8 mt-4 text-left relative flex flex-col">
                      <div className="w-full h-[2px] bg-stone-800 mb-3"></div>
                      <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2 leading-tight">
                        {chapterName}
                      </h2>
                      {chapterSub && (
                        <div className="text-[15px] font-serif text-stone-700 mb-6 leading-relaxed bg-stone-50/60 p-4 rounded-sm border-l-2 border-memory-maroon/40 whitespace-pre-line">
                          {chapterSub}
                        </div>
                      )}
                    </div>

                    {/* Render INDIVIDUAL MemoryCards sequentially for proper audio & comment mapping */}
                    <div className="flex flex-col">
                      {chapterMemories.map((mem, memIdx) => (
                        <MemoryCard
                          key={mem.id}
                          mem={mem}
                          isHighlighted={memIdx === 0}
                          currentReaction={reactions[mem.id] || { count: 0, reacted: false }}
                          handleToggleReaction={handleToggleReaction}
                          isCommentsOpen={openCommentsId === mem.id}
                          setOpenCommentsId={setOpenCommentsId}
                          commentsList={commentsMap[mem.id] || []}
                          commentInputValue=""
                          setCommentInputValue={() => {}}
                          handlePostComment={async () => {}}
                        />
                      ))}
                    </div>

                  </div>
                );
              })
            )}

            {/* End of Book Seal */}
            {liveMemories.length > 0 && (
              <div className="mt-20 flex flex-col items-center justify-center opacity-90 pb-8 border-t border-stone-200/60 pt-12">
                <div className="w-14 h-14 rounded-full border border-stone-300 flex items-center justify-center bg-stone-100 text-stone-500 font-serif italic text-2xl">
                  {subjectName.charAt(0).toUpperCase()}
                </div>
                <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 mt-6 font-semibold">
                  Sealed & Shared
                </p>
                <p className="text-[14px] font-serif italic text-stone-500 mt-2">
                  Preserved for family and loved ones.
                </p>
              </div>
            )}
          </div>
        </main>

        <MemoirSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          mockShortQuotes={liveShortQuotes} 
          chapters={liveChaptersList}
          decades={liveDecadesList}
        />
      </div>

      {showScatteredView && livePhotos.length > 0 && (
        <ScatteredGallery
          heroPhotos={livePhotos}
          onClose={() => setShowScatteredView(false)}
        />
      )}
    </div>
  );
}