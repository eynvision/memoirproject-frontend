"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/client";

// reusing your existing components
import { BookCoverExperience } from "@/features/dashboard/components/BookCoverExperience";
import { MemoryArchive } from "@/features/dashboard/components/MemoryArchive";

export default function ContributorPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memoirData, setMemoirData] = useState<any>(null);
  const [expandedStacks, setExpandedStacks] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchSharedMemoir = async () => {
      try {
        const data = await api.getSharedMemoir(token);
        setMemoirData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load the memoir.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMemoir();
  }, [token]);

  const toggleStack = (kind: string) => {
    setExpandedStacks(prev => 
      prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-memory-bg flex items-center justify-center">
        <p className="text-memory-muted tracking-widest uppercase animate-pulse text-sm font-sans">
          Opening Archive...
        </p>
      </div>
    );
  }

  if (error || !memoirData) {
    return (
      <div className="min-h-screen bg-memory-bg flex flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <h1 className="text-2xl text-stone-900 font-bold">Link Unavailable</h1>
        <p className="text-stone-600 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <BookCoverExperience userName="Contributor">
      <div className="min-h-screen bg-memory-bg text-stone-900 font-sans flex flex-col items-center pt-16 pb-32">
        
        <header className="mb-12 text-center px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-memory-primary mb-3 tracking-tight">
            Family Memoir Archive
          </h1>
          <p className="text-stone-600 tracking-[0.15em] uppercase text-xs font-bold">
            You are invited to contribute
          </p>
        </header>

        <main className="max-w-3xl w-full px-6">
          {/* renders the existing memories fetched from the shared link */}
          <MemoryArchive 
            expandedStacks={expandedStacks} 
            toggleStack={toggleStack} 
            mockMemories={memoirData.memories || []} 
          />
          
          {/* you can add your MemoryInputSection here later to allow them to add new memories */}
        </main>
        
      </div>
    </BookCoverExperience>
  );
}