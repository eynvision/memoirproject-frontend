import React from "react";

interface DashboardHeaderProps {
  subjectName?: string;
  dob?: string;
  dod?: string;
  onLogout?: () => void;
  onPreviewMemoir?: () => void;
}

export function DashboardHeader({
  subjectName = "Ahmad Khan",
  dob = "1942",
  dod = "2024",
  onLogout,
  onPreviewMemoir,
}: DashboardHeaderProps) {
  return (
    <header className="bg-memory-card border-b border-memory-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* MEMOIR SUBJECT DETAILS (NAME, DOB, DOD) --- */}
      <div className="text-right">
        <h2 className="text-base sm:text-lg font-serif font-bold text-memory-primary tracking-tight">
          {subjectName}
        </h2>
        <p className="text-xs text-memory-muted font-serif italic">
          {dob} — {dod}
        </p>
      </div>

      {/* ---PREVIEW MEMOIR & LOGOUT ACTIONS --- */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onPreviewMemoir}
          className="border border-memory-maroon text-memory-maroon hover:bg-memory-maroon hover:text-memory-light px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          Preview Memoir
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="bg-memory-maroon hover:bg-memory-primary text-memory-light px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
