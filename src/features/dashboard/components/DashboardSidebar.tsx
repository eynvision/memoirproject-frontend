/**
 * @file DashboardSidebar.tsx
 * @description Sidebar navigation component featuring the tactile stacked cards and logout functionality.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { destroySession } from "@/app/actions/auth";

interface DashboardSidebarProps {
  setShowContributors: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardSidebar({ setShowContributors }: DashboardSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. Wipe all local memoir and user data to protect privacy
    localStorage.removeItem("active_memoir");
    localStorage.removeItem("pending_memoir");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("user_name");
    localStorage.removeItem("onboarding_initial_memory");
    localStorage.removeItem("onboarding_memory_date");

    // 2. Destroy the HTTP-only secure cookie via Server Action
    await destroySession();

    // 3. Kick the user safely back to the login screen
    router.push("/login");
  };

  return (
    <aside className="w-68 bg-memory-primary text-memory-light p-6 hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20 shadow-[inset_-12px_0_25px_rgba(0,0,0,0.25)] border-r border-[#240d14]">
      <div>
        <div className="mb-10 pb-6">
          <span className="font-sans text-2xl tracking-wide text-white font-normal">Family Archive</span>
        </div>

        {/* Restored Tactile Stacked Counter Artifact */}
        <div className="mb-16 relative w-full h-24 items-center justify-center flex perspective-[1000px]">
          <div className="absolute inset-0 bg-[#E5DFD6] shadow-sm rounded-sm transform -rotate-3 translate-y-2 border border-stone-300" />
          <div className="absolute inset-0 bg-[#F8F5F1] shadow-sm rounded-sm transform rotate-2 translate-x-1 border border-stone-200" />
          <div 
            className="absolute inset-0 bg-white text-stone-900 shadow-md rounded-sm transform -rotate-1 border border-stone-300 flex flex-col items-center justify-center p-2 z-10"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")` }}
          >
            <span className="font-sans text-[11px] text-stone-500 leading-tight">Archive Holds</span>
            <span className="font-sans uppercase tracking-[0.15em] text-[13px] text-memory-primary font-bold mt-1">20 Memories</span>
          </div>
        </div>

        {/* Navigation Blocks */}
        <nav className="space-y-4 font-sans text-[13px] pt-8">
          <motion.a 
            href="#overview" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center text-stone-900 bg-white px-4 py-3 rounded-sm shadow-sm transition-all border-l-4 border-memory-primary font-medium w-36 ml-0 transform -rotate-1 hover:rotate-0"
          >
            New Memory
          </motion.a>

          <motion.a 
            href="#archive" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center text-stone-800 bg-white hover:bg-[#FAF7F2] px-4 py-3 rounded-sm shadow-sm transition-all border-l-2 border-stone-400 w-36 ml-16 transform rotate-1 hover:rotate-0"
          >
            View Archive
          </motion.a>

          <motion.button 
            type="button"
            onClick={() => setShowContributors(prev => !prev)} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-36 ml-6 text-center flex items-center justify-center text-stone-800 bg-white hover:bg-[#FAF7F2] px-4 py-3 rounded-sm shadow-sm transition-all border-l-2 border-stone-400 cursor-pointer transform -rotate-1 hover:rotate-0"
          >
            Contributors
          </motion.button>
        </nav>
      </div>

      {/* Logout Button anchored to the bottom */}
      <div className="mb-6 font-sans text-[13px]">
        <motion.button 
          type="button"
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-36 ml-10 text-center flex items-center justify-center text-stone-800 bg-white hover:bg-[#FAF7F2] px-4 py-3 rounded-sm shadow-sm transition-all border-l-2 border-stone-400 cursor-pointer transform rotate-2 hover:rotate-0"
        >
          Log Out
        </motion.button>
      </div>
    </aside>
  );
}