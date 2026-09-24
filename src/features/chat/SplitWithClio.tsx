/**
 * @file features/chat/SplitWithClio.tsx
 * @description Split-screen layout: page content scrolls on the left while the
 * Clio chat stays docked on the right at full height. The chat starts compact
 * and its width can be changed by dragging the divider. Hidden on narrow screens.
 */

"use client";

import { ReactNode, useState } from "react";
import ClioChatPanel from "./ClioChatPanel";

const DEFAULT_WIDTH = 300;
const MIN_WIDTH = 240;
const MAX_WIDTH_RATIO = 0.6;

interface SplitWithClioProps {
  memoirId: string;
  children: ReactNode;
  /** Hide the chat (e.g. published memoirs are read-only). */
  hideChat?: boolean;
  onChanged?: () => void;
}

export default function SplitWithClio({ memoirId, children, hideChat, onChanged }: SplitWithClioProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);

  const clamp = (value: number) =>
    Math.min(Math.max(value, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth * MAX_WIDTH_RATIO));

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setWidth(clamp(window.innerWidth - e.clientX));
  };
  const onPointerUp = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setWidth((w) => clamp(w + 24));
    if (e.key === "ArrowRight") setWidth((w) => clamp(w - 24));
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-memory-bg ${dragging ? "select-none" : ""}`}>
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      {!hideChat && memoirId && (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            className={`hidden w-1.5 shrink-0 cursor-col-resize touch-none transition-colors hover:bg-memory-accent focus:bg-memory-accent focus:outline-none lg:block ${
              dragging ? "bg-memory-accent" : "bg-memory-border"
            }`}
          />
          <div className="hidden h-screen shrink-0 lg:block" style={{ width }}>
            <ClioChatPanel memoirId={memoirId} onChanged={onChanged} />
          </div>
        </>
      )}
    </div>
  );
}
