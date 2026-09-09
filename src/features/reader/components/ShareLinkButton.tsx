// src/features/reader/components/ShareLinkButton.tsx
"use client";
import { useState } from "react";
import { Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShareLink } from "@/features/reader/api";

export function ShareLinkButton({ memoirId }: { memoirId: string }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copyPublicLink() {
    setBusy(true);
    try {
      const { token } = await getShareLink(memoirId);
      await navigator.clipboard.writeText(`${window.location.origin}/book/${token}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard or network failure leaves the button ready to retry.
    }
    setBusy(false);
  }

  function downloadPdf() {
    window.open(`/read/${memoirId}/print`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={copyPublicLink} disabled={busy}>
        <Link2 className="size-4" />
        {copied ? "Link copied" : "Copy public link"}
      </Button>
      <Button variant="outline" onClick={downloadPdf}>
        <FileText className="size-4" />
        Download PDF
      </Button>
    </div>
  );
}