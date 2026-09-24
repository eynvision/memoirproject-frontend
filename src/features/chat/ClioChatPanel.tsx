/**
 * @file features/chat/ClioChatPanel.tsx
 * @description Always-visible chat panel docked beside the page content.
 * Clio can answer questions about the memoir and propose changes, which the
 * user applies or discards.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";
import ProposalCard from "./ProposalCard";

interface ClioChatPanelProps {
  memoirId: string;
  /** Called after the user applies a change, so the page can refresh its data. */
  onChanged?: () => void;
}

const SUGGESTIONS = [
  "Why did you group these memories together?",
  "Give me an overview of my chapters.",
  "Suggest a better title for chapter 1.",
];

export default function ClioChatPanel({ memoirId, onChanged }: ClioChatPanelProps) {
  const [draft, setDraft] = useState("");
  const { messages, actions, sending, error, send, resolve } = useChat(memoirId, Boolean(memoirId), onChanged);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, actions, sending]);

  if (!memoirId) return null;

  const submit = () => {
    const text = draft;
    setDraft("");
    void send(text);
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-memory-border bg-memory-bg">
      <header className="border-b border-memory-border bg-memory-maroon px-5 py-4">
        <h2 className="font-serif text-lg font-bold text-memory-light">
          <span className="mr-2 text-memory-accent">✦</span>Clio
        </h2>
        <p className="text-[11px] text-memory-accent">Your memoir assistant</p>
      </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-memory-border bg-memory-card p-4">
              <p className="font-serif text-sm text-memory-maroon">
                Hello! Ask me about how your memoir is organised, or tell me what you&apos;d like to change.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-lg border border-memory-border bg-memory-bg px-3 py-2 text-left text-xs text-memory-primary hover:border-memory-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-memory-maroon px-4 py-2 text-sm leading-6 text-memory-light"
                    : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-memory-border bg-memory-card px-4 py-2 text-sm leading-6 text-memory-primary"
                }
              >
                {m.text}
              </p>
            </div>
          ))}

          {actions.map((a) => (
            <ProposalCard key={a.id} action={a} onResolve={resolve} />
          ))}

          {sending && <p className="text-xs italic text-memory-muted">Clio is thinking...</p>}
          {error && <p className="text-xs text-memory-required">{error}</p>}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-end gap-2 border-t border-memory-border bg-memory-card p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder="Message Clio..."
            className="flex-1 resize-none rounded-lg border border-memory-border bg-memory-bg px-3 py-2 text-sm text-memory-primary outline-none focus:border-memory-accent"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-lg bg-memory-maroon px-4 py-2 text-sm font-medium text-memory-light hover:bg-memory-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
    </aside>
  );
}
