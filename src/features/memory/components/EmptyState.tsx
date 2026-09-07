"use client";

import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-heading text-[28px] text-ink-900">No memories yet</p>
      <p className="max-w-[36ch] text-[15px] text-ink-500">
        Stories, photos and voice notes you add will appear here.
      </p>
      <Button size="lg" onClick={onAdd} className="mt-4 h-11 px-6">
        Add a memory
      </Button>
    </div>
  );
}