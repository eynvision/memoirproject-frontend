/**
 * @file OwnerDashboardPage.tsx
 * @description Main dashboard view incorporating the MemoryFeed input capture component
 * and the MemoryFeedList live database renderer.
 */

"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { MetricsGrid } from "./components/MetricsGrid";
import { MemoryFeed } from "./components/MemoryFeed";
import MemoryFeedList from "./MemoryFeedList";
import { BookCoverExperience } from "./BookCoverExperience";
import { useRouter } from "next/navigation";

interface MemoirLocalStorageData {
  data?: {
    id?: string;
  };
  id?: string;
}

export default function OwnerDashboardPage() {
  // State management for active navigation tab and active memoir container ID
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [memoirId, setMemoirId] = useState<string>("");
  const router = useRouter();

  // Retrieve active memoir identifier securely from local storage on mount
  useEffect(() => {
    try {
      const savedMemoir = localStorage.getItem("active_memoir");
      if (savedMemoir) {
        const parsed = JSON.parse(savedMemoir) as MemoirLocalStorageData;
        const activeId = parsed.data?.id || parsed.id || "";
        setMemoirId(activeId);
      }
    } catch (err: unknown) {
      console.error("Failed to read active memoir from localStorage", err);
    }
  }, []);

  // Metrics data configuration for dashboard overview
  const metricsData = [
    {
      label: "Total Entries",
      value: "Live",
    },
    {
      label: "Media Vault",
      value: "Active",
    },
    {
      label: "Collaborators",
      value: 1,
    },
  ];

  // Handle user logout action and clear authentication tokens
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("active_memoir");
    router.push("/");
  };

  // Navigate to the memoir preview/edit/publish flow
  const handlePreviewMemoir = () => {
    router.push("/memoir-preview");
  };

  return (
    <BookCoverExperience
      title="Personal Life Memoir"
      subtitle="A preserved record of personal stories, reflections, and voice notes."
    >
      <div className="flex min-h-screen overflow-hidden rounded-2xl border border-memory-border bg-memory-bg text-memory-primary shadow-lg">
        {/* =========================
            SIDEBAR NAVIGATION
        ========================= */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* =========================
            MAIN CONTENT AREA
        ========================= */}
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <DashboardHeader
            subjectName="Ahmad Khan"
            dob="1942"
            dod="2024"
            onLogout={handleLogout}
            onPreviewMemoir={handlePreviewMemoir}
          />

          <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            {/* Dashboard Banner Intro */}
            <div className="mb-7">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-memory-accent">
                Living Archive
              </p>

              <h1 className="font-serif text-2xl font-bold tracking-tight text-memory-maroon sm:text-3xl">
                Preserve the moments that matter.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-memory-muted">
                Capture stories, voices, photographs, and memories to build a
                lasting personal archive.
              </p>
            </div>

            {/* Metrics Overview Grid */}
            <div className="mb-9">
              <MetricsGrid metrics={metricsData} />
            </div>

            {/* =========================================
                TAB: FEED (Capture Form + Live Feed List)
            ========================================= */}
            {activeTab === "feed" && (
              <div className="space-y-10">
                {/* 1. MemoryFeed Component: Interactive entry capture cards & forms */}
                <MemoryFeed 
                  memories={[]} 
                  memoirId={memoirId} 
                  onSuccess={() => {
                    // Automatically reload feed view when a new memory is successfully saved
                    window.location.reload();
                  }}
                />

                {/* 2. MemoryFeedList Component: Fetches and displays live database records */}
                {memoirId ? (
                  <MemoryFeedList memoirId={memoirId} />
                ) : (
                  <div className="text-center py-12 text-memory-muted text-sm bg-white rounded-2xl border border-memory-maroon/20 p-6">
                    No active memoir container found. Please complete onboarding.
                  </div>
                )}
              </div>
            )}

            {/* =========================
                TAB: MEDIA VAULT
            ========================= */}
            {activeTab === "media" && (
              <section className="rounded-3xl border border-memory-border bg-memory-card p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-memory-accent bg-memory-light font-serif text-xl font-bold text-memory-maroon">
                  M
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-memory-maroon">
                  Media Vault
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-memory-muted">
                  Your photographs and other preserved media will appear here.
                </p>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-memory-accent">
                  Coming soon
                </p>
              </section>
            )}

            {/* =========================
                TAB: COLLABORATORS
            ========================= */}
            {activeTab === "team" && (
              <section className="rounded-3xl border border-memory-border bg-memory-card p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-memory-accent bg-memory-light font-serif text-xl font-bold text-memory-maroon">
                  M
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-memory-maroon">
                  Collaborators
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-memory-muted">
                  Family members and invited contributors will be managed from
                  this space.
                </p>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-memory-accent">
                  Coming soon
                </p>
              </section>
            )}
          </div>
        </main>
      </div>
    </BookCoverExperience>
  );
}