"use client";
import { useState } from "react";
import ReactionPicker from "./ReactionPicker";

interface MemoryCardProps {
    author: string;
    role: string;
    initials: string;
    type: "audio" | "photo";
    content?: string;
    imageSrc?: string;
    audioDuration?: string;
    isPlaying?: boolean;
    onTogglePlay?: () => void;
}

export default function MemoryCard({
    author,
    role,
    initials,
    type,
    content,
    imageSrc,
    audioDuration,
    isPlaying,
    onTogglePlay,
}: MemoryCardProps) {
    const [reactions, setReactions] = useState({
        like: { count: 12, active: false, emoji: '👍' },
        love: { count: 14, active: true, emoji: '❤️' },
        hug: { count: 8, active: false, emoji: '🥰' }, // Fixed rendering issue with reliable emoji
        laugh: { count: 5, active: false, emoji: '😂' },
        wow: { count: 3, active: false, emoji: '😮' },
        sad: { count: 2, active: false, emoji: '😢' },
        angry: { count: 1, active: false, emoji: '😡' },
    });

    const handleReaction = (type: string) => {
        setReactions((prev) => {
            const targetKey = type as keyof typeof prev;
            const isCurrentlyActive = prev[targetKey].active;
            const updated = { ...prev };

            if (isCurrentlyActive) {
                // If clicking the active emoji again, toggle it off
                updated[targetKey] = {
                    ...updated[targetKey],
                    count: updated[targetKey].count - 1,
                    active: false,
                };
            } else {
                // Remove active status from any previously selected reaction
                Object.keys(updated).forEach((k) => {
                    const key = k as keyof typeof updated;
                    if (updated[key].active) {
                        updated[key] = {
                            ...updated[key],
                            count: updated[key].count - 1,
                            active: false,
                        };
                    }
                });

                // Activate the newly selected reaction
                updated[targetKey] = {
                    ...updated[targetKey],
                    count: updated[targetKey].count + 1,
                    active: true,
                };
            }

            return updated;
        });
    };

    return (
        <div className="bg-[#fdf8ed] p-7 rounded-2xl border border-[#f0e4d3] shadow-2xs flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#381c24] text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                        {initials}
                    </div>
                    <div>
                        <h4 className="font-serif font-medium text-[#381c24] text-base">{author}</h4>
                        <span className="text-xs text-[#78716c]">{role}</span>
                    </div>
                </div>

                {type === "audio" && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#f0e4d3]">
                        <button
                            onClick={onTogglePlay}
                            className="w-8 h-8 rounded-full bg-[#381c24] text-white flex items-center justify-center hover:bg-[#4a222a] transition-colors cursor-pointer shadow-2xs"
                        >
                            {isPlaying ? "❚❚" : "▶"}
                        </button>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 3, 2, 4, 5, 3, 2].map((h, i) => (
                                <div
                                    key={i}
                                    style={{ height: `${h * 4}px` }}
                                    className={`w-1 rounded-full transition-colors ${isPlaying ? "bg-[#c9a063] animate-pulse" : "bg-[#c9a063]/50"}`}
                                ></div>
                            ))}
                        </div>
                        <span className="text-xs font-mono text-[#57534e]">{audioDuration}</span>
                    </div>
                )}
            </div>

            {type === "photo" && imageSrc && (
                <div className="rounded-xl overflow-hidden border border-[#f0e4d3] bg-white shadow-sm max-h-96">
                    <img 
                        src={imageSrc} 
                        alt={author}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {content && (
                <p className="font-serif italic text-[#292524] text-lg leading-relaxed pl-5 border-l-2 border-[#c9a063]">
                    "{content}"
                </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#f0e4d3] relative">
                <ReactionPicker reactions={reactions} onReact={handleReaction} />
                <span className="text-xs text-[#78716c] font-serif italic">
                    {type === "audio" ? "Voice memory" : "Photograph memory"}
                </span>
            </div>
        </div>
    );
}