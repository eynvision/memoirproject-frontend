/**
 * @file hooks/useExportMemoir.ts
 * @description React hook for handling memoir PDF export requests, status polling, and direct browser attachment downloads.
 */

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api/client";

export function useExportMemoir(memoirId: string) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const triggerExport = async (customFileName?: string) => {
    setIsExporting(true);
    setError(null);
    setExportMessage("Preparing your printable memoir PDF...");

    try {
      let currentMemoirId = memoirId;

      if (!currentMemoirId) {
        const memoirs = await api.getUserMemoirs();
        currentMemoirId = memoirs[0]?.id || "";
      }

      if (!currentMemoirId) {
        throw new Error("No active memoir found.");
      }

      await api.requestMemoirExport(currentMemoirId);

      setExportMessage("Formatting book layout in the background...");

      let attempts = 0;
      const maxAttempts = 15;

      pollIntervalRef.current = setInterval(async () => {
        attempts++;

        try {
          const data = await api.getLatestExportStatus(currentMemoirId);

          if (data.status === "ready" && data.download_url) {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;

            setIsExporting(false);
            setExportMessage(
              "PDF downloaded successfully! Check your downloads folder."
            );

            const fileResponse = await fetch(data.download_url);
            const blob = await fileResponse.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            const fileName = customFileName?.trim()
              ? `${customFileName.trim()}.pdf`
              : "my-memoir-archive.pdf";

            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);
          } else if (data.status === "failed") {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;

            setIsExporting(false);
            setError(
              `Export failed: ${
                data.error_message || "Unknown error"
              }`
            );
            setExportMessage(null);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;

            setIsExporting(false);
            setError("Export timed out. Please try again.");
            setExportMessage(null);
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during export.";

      setError(errorMessage);
      setExportMessage(null);
      setIsExporting(false);
    }
  };

  return {
    triggerExport,
    isExporting,
    exportMessage,
    error,
  };
}