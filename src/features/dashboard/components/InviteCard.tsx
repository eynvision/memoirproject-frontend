"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteCard({ memoirId }: { memoirId: string }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${memoirId}`
      : `https://your-app.com/invite/${memoirId}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <section className="rounded-xl border border-paper-400 bg-paper-000 p-6 shadow-e1">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-200 text-ink-500">
          <UserPlus className="size-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-heading text-lg text-ink-900">
            Invite contributors
          </h2>
          <p className="mt-1 text-[15px] text-ink-500">
            Share this link with family and friends so they can contribute
            stories and photos to this memoir.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          readOnly
          value={inviteUrl}
          className="h-10 flex-1 bg-paper-000"
        />
        <Button variant="outline" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </section>
  );
}