/**
 * @file features/chat/useChat.ts
 * @description State for the Clio chat panel: loads history, sends messages,
 * and applies/discards the changes Clio proposes.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ChatActionEntity, ChatHistoryItem } from "@/lib/api/client";

export function useChat(memoirId: string, enabled: boolean, onChanged?: () => void) {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [actions, setActions] = useState<ChatActionEntity[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !memoirId) return;
    let cancelled = false;
    api
      .getChatHistory(memoirId)
      .then((h) => {
        if (cancelled) return;
        setMessages(h.messages);
        setActions(h.pending_actions);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load the conversation.");
      });
    return () => {
      cancelled = true;
    };
  }, [memoirId, enabled]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setError(null);
      setSending(true);
      setMessages((m) => [...m, { role: "user", text: trimmed }]);
      try {
        const res = await api.sendChatMessage(memoirId, trimmed);
        setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
        setActions((a) => [...a, ...res.pending_actions]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Clio is unavailable right now.");
      } finally {
        setSending(false);
      }
    },
    [memoirId, sending]
  );

  const resolve = useCallback(
    async (actionId: string, decision: "confirm" | "reject") => {
      setError(null);
      const summary = actions.find((x) => x.id === actionId)?.summary ?? "the change";
      try {
        if (decision === "confirm") {
          await api.confirmChatAction(memoirId, actionId);
          onChanged?.();
        } else {
          await api.rejectChatAction(memoirId, actionId);
        }
        setActions((a) => a.filter((x) => x.id !== actionId));
        setMessages((m) => [
          ...m,
          { role: "assistant", text: decision === "confirm" ? `✓ Applied: ${summary}` : `Discarded: ${summary}` },
        ]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update this change.");
        // The action may have been resolved elsewhere; drop it if it is no longer pending.
        api.getChatHistory(memoirId).then((h) => setActions(h.pending_actions)).catch(() => {});
      }
    },
    [memoirId, onChanged, actions]
  );

  return { messages, actions, sending, error, send, resolve };
}
