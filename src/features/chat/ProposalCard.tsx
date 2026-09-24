/**
 * @file features/chat/ProposalCard.tsx
 * @description A change Clio proposed, with Apply / Discard. Nothing changes
 * in the memoir until the user applies it.
 */

"use client";

import { useState } from "react";
import { ChatActionEntity } from "@/lib/api/client";

interface ProposalCardProps {
  action: ChatActionEntity;
  onResolve: (id: string, decision: "confirm" | "reject") => Promise<void>;
}

export default function ProposalCard({ action, onResolve }: ProposalCardProps) {
  const [busy, setBusy] = useState(false);

  const handle = async (decision: "confirm" | "reject") => {
    setBusy(true);
    await onResolve(action.id, decision);
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-memory-accent bg-memory-light p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-memory-accent">Suggested change</p>
      <p className="mt-1 text-sm leading-5 text-memory-primary">{action.summary}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handle("confirm")}
          disabled={busy}
          className="rounded-lg bg-memory-maroon px-3 py-1.5 text-[11px] font-medium text-memory-light hover:bg-memory-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Working..." : "Apply"}
        </button>
        <button
          type="button"
          onClick={() => handle("reject")}
          disabled={busy}
          className="rounded-lg border border-memory-border px-3 py-1.5 text-[11px] font-medium text-memory-primary hover:bg-memory-card disabled:opacity-60"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
