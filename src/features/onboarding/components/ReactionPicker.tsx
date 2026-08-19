"use client";
import { useState } from "react";

interface Reaction {
    count: number;
    active: boolean;
    emoji: string;
}

interface ReactionPickerProps {
    reactions: Record<string, Reaction>;
    onReact: (type: string) => void;
}

export default function ReactionPicker({ reactions, onReact }: ReactionPickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Find the currently active reaction, or fallback to ❤️
    const activeEntry = Object.entries(reactions).find(([_, r]) => r.active);
    const displayEmoji = activeEntry ? activeEntry[1].emoji : '❤️';
    const totalCount = Object.values(reactions).reduce((acc, r) => acc + r.count, 0);

    return (
        <div className="relative inline-block">
            {/* Floating Reaction Picker Popup */}
            {showPicker && (
                <div
                    onMouseLeave={() => setShowPicker(false)}
                    className="absolute bottom-full mb-3 left-0 bg-white border border-[#f0e4d3] shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 z-30 animate-in fade-in zoom-in-95 duration-200"
                >
                    {Object.entries(reactions).map(([key, data]) => (
                        <button
                            key={key}
                            onClick={() => { 
                                onReact(key); 
                                setShowPicker(false); 
                            }}
                            className="hover:scale-135 transition-transform text-2xl cursor-pointer p-1 bg-transparent border-none"
                            title={key}
                        >
                            {data.emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Trigger Button */}
            <div 
                className="relative inline-flex items-center gap-2 bg-white border border-[#f0e4d3] rounded-full px-4 py-2 shadow-2xs hover:border-[#c9a063] transition-all cursor-pointer"
                onMouseEnter={() => setShowPicker(true)}
            >
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#381c24] cursor-pointer bg-transparent border-none p-0"
                >
                    <span className="text-base">{displayEmoji}</span>
                    <span className="font-semibold">{totalCount}</span>
                </button>
                <div className="flex items-center gap-1 text-[11px] text-[#78716c] border-l border-[#f0e4d3] pl-2">
                    <span>React</span>
                    <span className="text-[10px]">▼</span>
                </div>
            </div>
        </div>
    );
}