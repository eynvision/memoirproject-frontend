"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { MetricsGrid } from "./components/MetricsGrid";
import { MemoryFeed } from "./components/MemoryFeed";
import MemoryFeedList from "./MemoryFeedList";
import { BookCoverExperience } from "./BookCoverExperience";
import { ChapterOrganizer } from "./components/ChapterOrganizer";

import SplitWithClio from "@/features/chat/SplitWithClio";

interface MemoirData {
  id?: string;
  subject_name?: string;
  subject_born_on?: string;
  subject_died_on?: string;
  subject_is_living?: boolean;
}

interface MemoirLocalStorageData {
  data?: MemoirData;
  id?: string;
  subject_name?: string;
  subject_born_on?: string;
  subject_died_on?: string;
  subject_is_living?: boolean;
}

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [memoirId, setMemoirId] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("Ahmad Khan");
  const [dob, setDob] = useState<string>("1942");
  const [dod, setDod] = useState<string>("2024");

  const router = useRouter();

  // Changes whenever a new memory is successfully created.
  // This forces MemoryFeedList to remount and fetch the latest data.
  const [feedRefreshKey, setFeedRefreshKey] = useState<number>(0);

  useEffect(() => {
    try {
      const savedMemoir = localStorage.getItem("active_memoir");

      if (savedMemoir) {
        const parsed = JSON.parse(
          savedMemoir
        ) as MemoirLocalStorageData;

        const memoirObj = parsed.data || parsed;

        if (memoirObj.id) {
          setMemoirId(memoirObj.id);
        }

        if (memoirObj.subject_name) {
          setSubjectName(memoirObj.subject_name);
        }

        if (memoirObj.subject_born_on) {
          setDob(memoirObj.subject_born_on.substring(0, 4));
        }

        if (memoirObj.subject_died_on) {
          setDod(memoirObj.subject_died_on.substring(0, 4));
        } else if (memoirObj.subject_is_living) {
          setDod("Present");
        }
      }
    } catch (err: unknown) {
      console.error(
        "Failed to read active memoir from localStorage",
        err
      );
    }
  }, []);

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
      <SplitWithClio memoirId={memoirId}>
      <div className="flex min-h-full overflow-hidden bg-memory-bg text-memory-primary">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          memoirId={memoirId}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <DashboardHeader
            subjectName={subjectName}
            dob={dob}
            dod={dod}
            onLogout={handleLogout}
            onPreviewMemoir={handlePreviewMemoir}
          />

          <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
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

            <div className="mb-9">
              <MetricsGrid metrics={metricsData} />
            </div>

            {/* =========================
                FEED TAB
               ========================= */}
            {activeTab === "feed" && (
              <div className="space-y-10">
                <MemoryFeed
                  memories={[]}
                  memoirId={memoirId}
                  onSuccess={() => {
                    // Incrementing this value changes the key on
                    // MemoryFeedList, causing it to remount and
                    // retrieve the newly-created memory.
                    setFeedRefreshKey((prev) => prev + 1);
                  }}
                />

                {/* The comment must be outside the ternary expression. */}
                {memoirId ? (
                  <MemoryFeedList
                    key={feedRefreshKey}
                    memoirId={memoirId}
                  />
                ) : (
                  <div className="rounded-2xl border border-memory-maroon/20 bg-white p-6 py-12 text-center text-sm text-memory-muted">
                    No active memoir container found. Please complete
                    onboarding.
                  </div>
                )}
              </div>
            )}

            {/* =========================
                CHAPTERS TAB
               ========================= */}
            {activeTab === "chapters" && (
              <ChapterOrganizer memoirId={memoirId} />
            )}

            {/* =========================
                MEDIA TAB
               ========================= */}
            {activeTab === "media" && (
              <div className="rounded-2xl border border-memory-border bg-white p-8">
                <h2 className="font-serif text-xl font-semibold text-memory-maroon">
                  Media Vault
                </h2>

                <p className="mt-2 text-sm text-memory-muted">
                  Your media collection will appear here.
                </p>
              </div>
            )}

            {/* =========================
                TEAM TAB
               ========================= */}
            {activeTab === "team" && (
              <div className="rounded-2xl border border-memory-border bg-white p-8">
                <h2 className="font-serif text-xl font-semibold text-memory-maroon">
                  Collaborators
                </h2>

                <p className="mt-2 text-sm text-memory-muted">
                  Your collaborators and team members will appear here.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      </SplitWithClio>
    </BookCoverExperience>
  );
}