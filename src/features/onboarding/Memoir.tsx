"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MemoryCard from "./components/MemoryCard";

export default function MemoirPage() {
    const [activeTab, setActiveTab] = useState("chapter-1");
    const [isPlaying, setIsPlaying] = useState(false);

    // States for Link Sharing & Modals
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState("We are collecting stories and voice memories for Hussain's permanent archive. Could you share your favorite memory?");
    const [copied, setCopied] = useState(false);

    const shareLink = "https://archive.memoir.io/share/hussainusman-legacy";

    const handleCopy = () => {
        const fullText = `${customMessage}\n\nLink to contribute: ${shareLink}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setIsCopyModalOpen(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-white text-[#381c24] flex flex-col font-sans selection:bg-[#381c24] selection:text-white">

            <header className="w-full text-[#381c24] py-16 px-8 text-center relative overflow-hidden border-b border-[#f0e4d3] bg-white">
                <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center gap-5">

                    {/* Title Section */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.25em] text-[#c9a063] font-bold">Permanent Family Archive</span>
                        <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-[#381c24]">
                            <span className="italic font-light">Hussain Usman</span>
                        </h1>
                    </div>

                    {/* Proper Framed Photograph */}
                    <div className="relative group my-2">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl p-1.5 bg-white shadow-xl border border-[#f0e4d3] overflow-hidden">
                            <img
                                className="w-full h-full object-cover rounded-xl grayscale-[15%] hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>

                    {/* Clean Action Buttons */}
                    <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                        <button
                            onClick={() => setIsCopyModalOpen(true)}
                            className="bg-[#381c24] text-white px-6 py-3 rounded-xl text-xs md:text-sm font-semibold tracking-wide shadow-md hover:bg-[#4a222a] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            <span>Copy Contributor Link</span>
                        </button>

                        <button
                            onClick={() => alert("Generating printable PDF archive...")}
                            className="bg-white text-[#381c24] px-5 py-3 rounded-xl text-xs md:text-sm font-medium border border-[#f0e4d3] hover:bg-[#faf8f5] transition-all duration-300 shadow-2xs flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span>Export PDF</span>
                        </button>
                    </div>

                </div>
            </header>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 px-8 py-16 gap-12 bg-white">

                {/* Left Sidebar: Table of Chapters */}
                <aside className="lg:col-span-3 flex flex-col gap-3 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar bg-white">
                    <h5 className="text-[11px] uppercase tracking-widest text-[#57534e] font-bold shrink-0">
                        Table of Chapters
                    </h5>
                    <div className="flex flex-col gap-3 shrink-0 pb-6">
                        {[
                            { id: "chapter-1", title: "I. Early Roots & Childhood", count: "12 stories" },
                            { id: "chapter-2", title: "II. The Working Years", count: "18 stories" },
                            { id: "chapter-3", title: "III. Fatherhood & Wisdom", count: "24 stories" },
                            { id: "chapter-4", title: "IV. Quiet Habits & Joys", count: "9 stories" },
                        ].map((chap) => {
                            const isActive = activeTab === chap.id;
                            return (
                                <motion.button
                                    key={chap.id}
                                    onClick={() => setActiveTab(chap.id)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`text-left px-5 py-4 rounded-2xl transition-all duration-300 flex flex-col gap-1 relative cursor-pointer border ${isActive
                                        ? "bg-[#381c24] text-white border-[#381c24] shadow-md"
                                        : "bg-[#fdf8ed] border-[#f0e4d3] hover:border-[#c9a063] text-[#381c24] shadow-2xs"
                                        }`}
                                >
                                    <span className="font-serif font-medium text-base">{chap.title}</span>
                                    <span className={`text-xs ${isActive ? "text-[#c9a063]" : "text-[#78716c]"}`}>
                                        {chap.count}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#c9a063] rounded-r-full"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </aside>

                {/* Center/Right: Rich Book Reader Canvas */}
                <main className="lg:col-span-9 flex flex-col gap-10">

                    {/* ================= OWNER / CURATOR INPUT OPTIONS PANEL (Reduced width/padding, positioned above chapter canvas) ================= */}
                    <div className="bg-white border border-[#f0e4d3] p-5 rounded-2xl shadow-2xs flex flex-col gap-3 w-full mx-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-[#381c24] font-bold">
                                Add New Story to Chapter
                            </span>
                            <span className="text-xs text-[#78716c] font-serif italic">Curator mode</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            <button
                                onClick={() => alert("Opening Audio Recorder...")}
                                className="bg-[#fdf8ed] hover:bg-[#faeedb] border border-[#f0e4d3] p-3 rounded-xl flex items-center text-left gap-3 transition-all cursor-pointer shadow-2xs group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#381c24] text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                                    🎙️
                                </div>
                                <div className="overflow-hidden">
                                    <h6 className="font-serif font-medium text-[11px] text-[#381c24] truncate">Record Audio</h6>
                                    <p className="text-[9px] text-[#78716c] truncate">Voice memory</p>
                                </div>
                            </button>

                            <button
                                onClick={() => alert("Opening Text Story Editor...")}
                                className="bg-[#fdf8ed] hover:bg-[#faeedb] border border-[#f0e4d3] p-3 rounded-xl flex items-center text-left gap-3 transition-all cursor-pointer shadow-2xs group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#381c24] text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                                    ✍️
                                </div>
                                <div className="overflow-hidden">
                                    <h6 className="font-serif font-medium text-[11px] text-[#381c24] truncate">Write Text</h6>
                                    <p className="text-[9px] text-[#78716c] truncate">Written memory</p>
                                </div>
                            </button>

                            <button
                                onClick={() => alert("Opening Photo Uploader...")}
                                className="bg-[#fdf8ed] hover:bg-[#faeedb] border border-[#f0e4d3] p-3 rounded-xl flex items-center text-left gap-3 transition-all cursor-pointer shadow-2xs group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#381c24] text-white flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                                    📷
                                </div>
                                <div className="overflow-hidden">
                                    <h6 className="font-serif font-medium text-[11px] text-[#381c24] truncate">Add Photograph</h6>
                                    <p className="text-[9px] text-[#78716c] truncate">Image & caption</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-[#f0e4d3] p-8 md:p-12 rounded-3xl shadow-sm relative overflow-hidden flex flex-col gap-8 bg-white"
                    >
                        {/* Chapter Header */}
                        <div className="flex items-center justify-between border-b border-[#f0e4d3] pb-6">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-[#c9a063] font-bold">Chapter I</span>
                                <h2 className="text-3xl font-serif text-[#381c24] mt-1">Early Roots & Childhood</h2>
                            </div>
                            <span className="text-xs text-[#57534e] font-mono bg-[#fdf8ed] px-3.5 py-1.5 rounded-xl border border-[#f0e4d3] shadow-2xs">
                                Curated by Hafsa Hashmi
                            </span>
                        </div>

                        {/* Story Card 1: Voice Memoir */}
                        <MemoryCard
                            author="Aunt Hafsa"
                            role="Recorded July 2026 • Voice Memoir"
                            initials="HH"
                            type="audio"
                            content="I still remember the summer we spent in the old courtyard. The sound of the evening breeze through the trees always brings back those golden afternoons..."
                            audioDuration="01:45"
                            isPlaying={isPlaying}
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                        />

                        {/* Story Card 2: Photograph Memoir */}
                        <MemoryCard
                            author="Uncle Hassan"
                            role="Added August 2026 • Photograph Archive"
                            initials="HU"
                            type="photo"
                            imageSrc="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800"
                            content="Family gathering during Eid celebrations at the old ancestral home. Unforgettable moments of joy and shared meals."
                        />

                        {/* ================= LIVING COMMENT & REFLECTION LAYER ================= */}
                        <div className="mt-4 pt-6 border-t border-[#f0e4d3] flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h5 className="text-[11px] uppercase tracking-widest text-[#57534e] font-bold">
                                    Comments (1)
                                </h5>
                                <span className="text-xs text-[#c9a063] font-serif italic">Live archive active</span>
                            </div>

                            {/* Comments Feed List */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#f0e4d3] text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white text-[#381c24] font-bold text-xs flex items-center justify-center border border-[#f0e4d3] shrink-0 mt-0.5">
                                        ZH
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-serif font-semibold text-[#381c24] text-xs">Zainab Hashmi</span>
                                            <span className="text-[10px] text-[#78716c] font-mono">2 days ago</span>
                                        </div>
                                        <p className="text-[#292524] text-xs leading-relaxed">I completely remember those afternoons! Thank you for preserving this memory so dearly.</p>
                                        <div className="flex items-center gap-4 mt-1 text-[11px] text-[#78716c]">
                                            <button className="hover:text-[#381c24] font-medium transition-colors cursor-pointer">Like</button>
                                            <button className="hover:text-[#381c24] font-medium transition-colors cursor-pointer">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add Comment Input Bar */}
                            <div className="flex items-center gap-2 mt-2 bg-white p-1.5 rounded-xl border border-[#f0e4d3] shadow-2xs">
                                <div className="w-7 h-7 rounded-full bg-[#381c24] text-white font-bold text-[10px] flex items-center justify-center shrink-0 ml-1">
                                    HU
                                </div>
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none text-[#381c24] placeholder:text-[#78716c]/60 font-sans"
                                />
                                <button className="bg-[#381c24] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#4a222a] transition-all cursor-pointer shrink-0">
                                    Post
                                </button>
                            </div>
                        </div>
                    </motion.div>

                </main>

            </div>

        </div>
    );
}