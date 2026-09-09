// src/features/reader/components/BookView.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link2, Pause, Play, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteComment, postComment, searchBook, toggleReaction } from "@/features/reader/api";
import {
  REACTIONS,
  type Book,
  type BookMemory,
  type CommentNode,
  type ReactionSummary,
  type SearchOut,
} from "@/features/reader/schemas";
import { formatDate } from "@/utils/date";

const NAME_STORAGE_KEY = "memoir.readerName";

type PendingReaction = {
  targetType: "memory" | "comment";
  targetId: string;
  kind: string;
};

type MediaTab = "images" | "audio" | "comments";

export function BookView({
  book: initialBook,
  mode,
  memoirId,
}: {
  book: Book;
  mode: "public" | "owner";
  memoirId: string;
}) {
  const [book, setBook] = useState<Book>(initialBook);
  const [readerName, setReaderName] = useState("");
  const [namePrompt, setNamePrompt] = useState<PendingReaction | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>("images");

  useEffect(() => {
    try {
      setReaderName(localStorage.getItem(NAME_STORAGE_KEY) ?? "");
    } catch {
      // Storage is optional; the name forms still work without it.
    }
  }, []);

  useEffect(() => {
    function onScroll() {
      const chapterSections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter-index]")
      );
      let chapter = 0;
      chapterSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 180) {
          chapter = Number(section.dataset.chapterIndex);
        }
      });
      setActiveChapter(chapter);

      const memorySections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-memory-id]")
      );
      let currentId: string | undefined;
      memorySections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 260) {
          currentId = section.dataset.memoryId;
        }
      });
      if (currentId) setActiveMemoryId(currentId);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [book]);

  function rememberName(name: string) {
    setReaderName(name);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // Ignore storage failures.
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitComment(
    memoryId: string,
    parentId: string | null,
    body: string,
    name: string
  ): Promise<string | null> {
    rememberName(name);
    try {
      const created = await postComment(memoirId, {
        memory_id: memoryId,
        body,
        author_name: name,
        parent_comment_id: parentId,
      });
      setBook((current) => ({
        ...current,
        chapters: current.chapters.map((chapter) => ({
          ...chapter,
          memories: chapter.memories.map((memory) => {
            if (memory.id !== memoryId) return memory;
            if (!parentId) {
              return { ...memory, comments: [...memory.comments, created] };
            }
            return {
              ...memory,
              comments: memory.comments.map((top) =>
                top.id === parentId
                  ? { ...top, replies: [...top.replies, created] }
                  : top
              ),
            };
          }),
        })),
      }));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Could not post the comment.";
    }
  }

  async function runReaction(reaction: PendingReaction, name: string) {
    rememberName(name);
    try {
      const result = await toggleReaction(memoirId, {
        target_type: reaction.targetType,
        target_id: reaction.targetId,
        kind: reaction.kind,
        author_name: name,
      });
      setBook((current) => ({
        ...current,
        chapters: current.chapters.map((chapter) => ({
          ...chapter,
          memories: chapter.memories.map((memory) => {
            if (result.target_type === "memory" && memory.id === result.target_id) {
              return { ...memory, reactions: result.summary };
            }
            if (result.target_type === "comment") {
              return {
                ...memory,
                comment_reactions: {
                  ...memory.comment_reactions,
                  [result.target_id]: result.summary,
                },
              };
            }
            return memory;
          }),
        })),
      }));
    } catch {
      // A failed reaction leaves the page unchanged.
    }
  }

  function requestReaction(reaction: PendingReaction) {
    if (readerName.trim()) {
      void runReaction(reaction, readerName.trim());
      return;
    }
    setNamePrompt(reaction);
  }

  async function removeComment(memoryId: string, commentId: string) {
    if (!window.confirm("Remove this comment and its replies from the memoir?")) return;
    try {
      await deleteComment(memoirId, commentId);
      setBook((current) => ({
        ...current,
        chapters: current.chapters.map((chapter) => ({
          ...chapter,
          memories: chapter.memories.map((memory) => {
            if (memory.id !== memoryId) return memory;
            return {
              ...memory,
              comments: memory.comments
                .filter((comment) => comment.id !== commentId)
                .map((comment) => ({
                  ...comment,
                  replies: comment.replies.filter((reply) => reply.id !== commentId),
                })),
            };
          }),
        })),
      }));
    } catch {
      // Keep the thread as-is when moderation fails.
    }
  }

  const allMemories = useMemo(
    () => book.chapters.flatMap((chapter) => chapter.memories),
    [book]
  );

  const activeMemory = useMemo(() => {
    if (activeMemoryId) {
      const found = allMemories.find((memory) => memory.id === activeMemoryId);
      if (found) return found;
    }
    return book.chapters[activeChapter]?.memories[0] ?? allMemories[0] ?? null;
  }, [activeMemoryId, activeChapter, allMemories, book]);

  const birthYear = book.memoir.subject_born_on
    ? new Date(book.memoir.subject_born_on).getFullYear()
    : null;
  const endYear = book.memoir.subject_died_on
    ? new Date(book.memoir.subject_died_on).getFullYear()
    : book.memoir.subject_is_living
    ? "Present"
    : null;

  const portrait = book.media_library.find((media) => media.kind === "photo");

  const panelHandlers = (memory: BookMemory) => ({
    commentsOpen: book.comments_open,
    isOwner: mode === "owner",
    readerName,
    onComment: (parentId: string | null, body: string, name: string) =>
      submitComment(memory.id, parentId, body, name),
    onReact: requestReaction,
    onDeleteComment: (commentId: string) => removeComment(memory.id, commentId),
  });

  return (
    <div className="min-h-screen bg-paper-100 text-ink-700">
      <header className="sticky top-0 z-40 border-b border-paper-400 bg-paper-000/95 backdrop-blur">
        <div className="py-3 text-center">
          <span className="font-heading text-sm uppercase tracking-[0.35em] text-brass-500">
            The Memoir
          </span>
        </div>
        <div className="relative mx-auto flex max-w-5xl items-center justify-center border-t border-paper-300 px-4 py-3">
          <nav className="flex flex-wrap items-center justify-center gap-2 text-base">
            <NavButton label="Introduction" onClick={() => scrollTo("section-overview")} />
            {book.chapters.map((chapter, index) => (
              <NavButton
                key={chapter.id ?? `virtual-${index}`}
                label={`Chapter ${index + 1}`}
                onClick={() => scrollTo(`section-chapter-${index}`)}
              />
            ))}
            <NavButton label="Epilogue" onClick={() => scrollTo("section-epilogue")} />
          </nav>
          <button
            type="button"
            aria-label="Search this memoir"
            onClick={() => setSearchOpen(true)}
            className="absolute right-4 grid size-10 place-items-center rounded-full text-ink-500 hover:bg-paper-200"
          >
            <Search className="size-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_480px]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-6">
            <div>
              <h1 className="font-heading text-2xl text-ink-900">
                {book.memoir.subject_name}
              </h1>
              <p className="mt-1 text-sm text-ink-500">A Memoir</p>
            </div>
            <nav className="space-y-1 border border-paper-400 bg-paper-000 p-4 text-sm shadow-e1">
              <TocLink label="Overview" onClick={() => scrollTo("section-overview")} />
              {book.chapters.map((chapter, index) => (
                <div key={chapter.id ?? `virtual-${index}`} className="pt-2">
                  <TocLink
                    label={`Chapter ${index + 1}: ${chapter.title}`}
                    active={activeChapter === index}
                    onClick={() => scrollTo(`section-chapter-${index}`)}
                  />
                  <div className="ml-4 space-y-1 border-l border-paper-300 pl-3 pt-1">
                    {chapter.memories.map((memory) => (
                      <button
                        key={memory.id}
                        type="button"
                        onClick={() => scrollTo(`memory-${memory.id}`)}
                        className="block w-full truncate text-left text-[13px] text-ink-500 hover:text-ember-600"
                      >
                        {memory.title || "Untitled"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <TocLink label="Epilogue" onClick={() => scrollTo("section-epilogue")} />
            </nav>
            <ShareRow />
          </div>
        </aside>

        <main className="min-w-0 space-y-16">
          <section id="section-overview" className="scroll-mt-32">
            <h2 className="font-heading text-4xl text-brass-500">
              {book.memoir.subject_name}
            </h2>
            <p className="mt-1 font-heading text-lg text-ink-700">Author&apos;s Facts</p>
            <div className="mt-6 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
              {portrait && (
                <figure>
                  <div className="bg-white p-1 shadow-e-print ring-1 ring-paper-400">
                    <img
                      src={portrait.playback_url}
                      alt={portrait.caption ?? book.memoir.subject_name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-xs text-ink-400">
                    {portrait.caption || "From the family archive."}
                  </figcaption>
                </figure>
              )}
              <div className="space-y-4 text-[15px] leading-relaxed">
                <p>
                  <strong className="font-heading">{book.memoir.subject_name}</strong>
                  <br />
                  {birthYear !== null && <>Born: {birthYear}. </>}
                  {endYear !== null && !book.memoir.subject_is_living && (
                    <>Died: {endYear}. </>
                  )}
                  {book.memoir.subject_is_living && <>Their story continues today. </>}
                </p>
                {book.memoir.description && <p>{book.memoir.description}</p>}
                <p>
                  This book gathers the memories, photographs and voice recordings
                  contributed by family and friends, arranged chapter by chapter in
                  the order of a life.
                </p>
              </div>
            </div>
          </section>

          {book.chapters.map((chapter, index) => (
            <section
              key={chapter.id ?? `virtual-${index}`}
              id={`section-chapter-${index}`}
              data-chapter-index={index}
              className="scroll-mt-32 border-t border-paper-400 pt-10"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
                Chapter {index + 1}
              </p>
              <h2 className="mt-1 font-heading text-3xl text-ink-900">{chapter.title}</h2>
              {chapter.summary && <p className="mt-2 text-ink-500">{chapter.summary}</p>}
              <div className="mt-8 space-y-12">
                {chapter.memories.map((memory) => (
                  <div key={memory.id} className="space-y-6">
                    <MemoryBlock memory={memory} onReact={requestReaction} />
                    <div className="xl:hidden">
                      <MemoryExtrasPanel
                        memory={memory}
                        activeTab={activeMediaTab}
                        onTabChange={setActiveMediaTab}
                        {...panelHandlers(memory)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section id="section-epilogue" className="scroll-mt-32 border-t border-paper-400 pt-10">
            <h2 className="font-heading text-3xl text-ink-900">Epilogue</h2>
            <p className="mt-4 max-w-prose leading-relaxed text-ink-500">
              A life is kept by the people who tell it. Thank you for reading, for
              remembering, and for adding your own line to this story.
            </p>
            <div className="mt-6">
              <ShareRow />
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-32 space-y-4">
            <div className="grid grid-cols-3 gap-1">
              {book.chapters.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollTo(`section-chapter-${index}`)}
                  className={`border py-2 text-sm font-medium transition-colors ${
                    activeChapter === index
                      ? "border-brass-500 bg-brass-500 text-paper-000"
                      : "border-paper-400 bg-paper-000 text-ink-500 hover:border-brass-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {activeMemory ? (
              <MemoryExtrasPanel
                memory={activeMemory}
                activeTab={activeMediaTab}
                onTabChange={setActiveMediaTab}
                {...panelHandlers(activeMemory)}
              />
            ) : (
              <div className="rounded-xl border border-paper-400 bg-paper-000 p-4 text-sm text-ink-400 shadow-e1">
                No memories yet — the media and conversation spaces will appear here.
              </div>
            )}
          </div>
        </aside>
      </div>

      {searchOpen && (
        <SearchOverlay
          memoirId={memoirId}
          onClose={() => setSearchOpen(false)}
          onJump={(memoryId) => {
            setSearchOpen(false);
            scrollTo(`memory-${memoryId}`);
          }}
        />
      )}

      {namePrompt && (
        <NameModal
          initialName={readerName}
          onCancel={() => setNamePrompt(null)}
          onConfirm={(name) => {
            const pending = namePrompt;
            setNamePrompt(null);
            void runReaction(pending, name);
          }}
        />
      )}
    </div>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 font-heading text-base font-medium text-ink-600 hover:bg-paper-200 hover:text-ink-900"
    >
      {label}
    </button>
  );
}

function TocLink({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full truncate rounded px-1 py-0.5 text-left ${
        active ? "font-medium text-brass-500" : "text-ink-600 hover:text-ember-600"
      }`}
    >
      {label}
    </button>
  );
}

function ShareRow() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable; the URL stays visible in the bar.
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-ink-500">
      <Link2 className="size-4" />
      <button type="button" onClick={copy} className="hover:text-ember-600">
        {copied ? "Link copied" : "Share this book"}
      </button>
    </div>
  );
}

function MemoryBlock({
  memory,
  onReact,
}: {
  memory: BookMemory;
  onReact: (reaction: PendingReaction) => void;
}) {
  const cover = memory.media.find((media) => media.kind === "photo");

  return (
    <article id={`memory-${memory.id}`} data-memory-id={memory.id} className="scroll-mt-32">
      <h3 className="font-heading text-2xl text-ink-900">
        {memory.title || "Untitled memory"}
      </h3>
      {cover && (
        <figure className="mt-4 max-w-md">
          <div className="bg-white p-1 shadow-e-print ring-1 ring-paper-400">
            <img
              src={cover.playback_url}
              alt={cover.caption ?? memory.title ?? "Memory photograph"}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {cover.caption && (
            <figcaption className="mt-1 text-xs text-ink-400">{cover.caption}</figcaption>
          )}
        </figure>
      )}
      {memory.body_text && (
        <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-ink-700">
          {memory.body_text}
        </p>
      )}
      {memory.transcript && (
        <details className="mt-3 max-w-prose rounded-lg border border-paper-400 bg-paper-000 p-3 text-sm text-ink-600">
          <summary className="cursor-pointer font-heading font-medium">
            Read the spoken words
          </summary>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{memory.transcript}</p>
        </details>
      )}
      <div className="mt-4">
        <ReactionBar
          summary={memory.reactions}
          onReact={(kind) => onReact({ targetType: "memory", targetId: memory.id, kind })}
        />
      </div>
    </article>
  );
}

function MemoryExtrasPanel({
  memory,
  activeTab,
  onTabChange,
  commentsOpen,
  isOwner,
  readerName,
  onComment,
  onReact,
  onDeleteComment,
}: {
  memory: BookMemory;
  activeTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  commentsOpen: boolean;
  isOwner: boolean;
  readerName: string;
  onComment: (parentId: string | null, body: string, name: string) => Promise<string | null>;
  onReact: (reaction: PendingReaction) => void;
  onDeleteComment: (commentId: string) => void;
}) {
  const photos = memory.media.filter((media) => media.kind === "photo");
  const audios = memory.media.filter((media) => media.kind !== "photo");

  return (
    <div className="overflow-hidden rounded-xl border border-paper-400 bg-paper-000 shadow-e1">
      <div className="border-b border-paper-400 bg-paper-100 px-4 py-3">
        <h3 className="font-heading text-sm font-medium text-ink-900 truncate" title={memory.title || "Untitled memory"}>
          {memory.title || "Untitled memory"}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-px border-b border-paper-400 bg-paper-400">
        <button
          type="button"
          onClick={() => onTabChange("images")}
          className={`px-3 py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "images"
              ? "bg-paper-000 text-ink-900"
              : "bg-paper-100 text-ink-500 hover:bg-paper-000"
          }`}
        >
          Images
        </button>
        <button
          type="button"
          onClick={() => onTabChange("audio")}
          className={`px-3 py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "audio"
              ? "bg-paper-000 text-ink-900"
              : "bg-paper-100 text-ink-500 hover:bg-paper-000"
          }`}
        >
          Audio
        </button>
        <button
          type="button"
          onClick={() => onTabChange("comments")}
          className={`px-3 py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "comments"
              ? "bg-paper-000 text-ink-900"
              : "bg-paper-100 text-ink-500 hover:bg-paper-000"
          }`}
        >
          Comments
        </button>
      </div>

      {activeTab === "images" && (
        <div className="p-4">
          {photos.length === 0 ? (
            <p className="text-xs text-ink-400">No photographs in this memory.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <div className="bg-white p-1 shadow-e1 ring-1 ring-paper-400">
                    <img
                      src={photo.playback_url}
                      alt={photo.caption ?? "Memory photograph"}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className="mt-1 line-clamp-2 text-[11px] text-ink-400">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "audio" && (
        <div className="p-4">
          {audios.length === 0 ? (
            <p className="text-xs text-ink-400">No recordings in this memory.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {audios.map((audio) => (
                <AudioPlayer key={audio.id} src={audio.playback_url} durationMs={audio.duration_ms} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="p-4">
          <div className="mt-3 space-y-3">
            {memory.comments.length === 0 && (
              <p className="text-xs text-ink-400">No comments yet — be the first to write.</p>
            )}
            {memory.comments.map((comment) => (
              <CommentThread
                key={comment.id}
                node={comment}
                memory={memory}
                isOwner={isOwner}
                readerName={readerName}
                onComment={onComment}
                onReact={onReact}
                onDeleteComment={onDeleteComment}
              />
            ))}
          </div>
          {commentsOpen ? (
            <div className="mt-4">
              <CommentForm
                initialName={readerName}
                placeholder="Share what this memory brings back…"
                onSubmit={(body, name) => onComment(null, body, name)}
              />
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-400">Comments are closed on this memoir.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CommentThread({
  node,
  memory,
  isOwner,
  readerName,
  onComment,
  onReact,
  onDeleteComment,
}: {
  node: CommentNode;
  memory: BookMemory;
  isOwner: boolean;
  readerName: string;
  onComment: (parentId: string | null, body: string, name: string) => Promise<string | null>;
  onReact: (reaction: PendingReaction) => void;
  onDeleteComment: (commentId: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const reactions = memory.comment_reactions[node.id] ?? { counts: {}, mine: [] };

  return (
    <div className="rounded-xl border border-paper-400 bg-paper-100 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">
          <span className="font-heading font-medium text-ink-900">{node.author_name}</span>
          <span className="ml-2 text-xs tabular-nums text-ink-400">
            {formatDate(node.created_at)}
          </span>
        </p>
        {isOwner && (
          <button
            type="button"
            aria-label="Remove comment"
            onClick={() => onDeleteComment(node.id)}
            className="grid size-7 place-items-center rounded-full text-ink-300 hover:bg-clay-100 hover:text-clay-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-700">{node.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ReactionBar
          summary={reactions}
          onReact={(kind) => onReact({ targetType: "comment", targetId: node.id, kind })}
        />
        <button
          type="button"
          onClick={() => setReplying((value) => !value)}
          className="text-xs font-medium text-ember-600 hover:text-ember-500"
        >
          Reply
        </button>
      </div>
      {replying && (
        <div className="mt-3">
          <CommentForm
            initialName={readerName}
            compact
            placeholder={`Reply to ${node.author_name}…`}
            onSubmit={async (body, name) => {
              const error = await onComment(node.id, body, name);
              if (!error) setReplying(false);
              return error;
            }}
          />
        </div>
      )}
      {node.replies.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-paper-300 pl-3">
          {node.replies.map((reply) => (
            <div key={reply.id} className="rounded-lg bg-paper-000 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="font-heading font-medium text-ink-900">
                    {reply.author_name}
                  </span>
                  <span className="ml-2 text-xs tabular-nums text-ink-400">
                    {formatDate(reply.created_at)}
                  </span>
                </p>
                {isOwner && (
                  <button
                    type="button"
                    aria-label="Remove reply"
                    onClick={() => onDeleteComment(reply.id)}
                    className="grid size-7 place-items-center rounded-full text-ink-300 hover:bg-clay-100 hover:text-clay-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-700">{reply.body}</p>
              <div className="mt-2">
                <ReactionBar
                  summary={memory.comment_reactions[reply.id] ?? { counts: {}, mine: [] }}
                  onReact={(kind) =>
                    onReact({ targetType: "comment", targetId: reply.id, kind })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReactionBar({
  summary,
  onReact,
}: {
  summary: ReactionSummary;
  onReact: (kind: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTIONS.map((reaction) => {
        const count = summary.counts[reaction.key] ?? 0;
        const mine = summary.mine.includes(reaction.key);
        return (
          <button
            key={reaction.key}
            type="button"
            title={reaction.label}
            aria-label={reaction.label}
            onClick={() => onReact(reaction.key)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors ${
              mine
                ? "border-ember-500 bg-ember-100 text-ember-600"
                : "border-paper-400 bg-paper-000 text-ink-500 hover:border-ember-500"
            }`}
          >
            <span aria-hidden>{reaction.emoji}</span>
            {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function CommentForm({
  initialName,
  placeholder,
  compact,
  onSubmit,
}: {
  initialName: string;
  placeholder: string;
  compact?: boolean;
  onSubmit: (body: string, name: string) => Promise<string | null>;
}) {
  const [name, setName] = useState(initialName);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setName(initialName), [initialName]);

  async function submit() {
    const trimmedName = name.trim();
    const trimmedBody = body.trim();
    if (trimmedName.length < 2 || trimmedName.toLowerCase() === "anonymous") {
      setError("Please sign with your name (not 'Anonymous').");
      return;
    }
    if (!trimmedBody) {
      setError("Please write something before posting.");
      return;
    }
    setBusy(true);
    setError(null);
    const failure = await onSubmit(trimmedBody, trimmedName);
    setBusy(false);
    if (failure) {
      setError(failure);
      return;
    }
    setBody("");
  }

  return (
    <div
      className={`space-y-2 ${
        compact ? "" : "rounded-xl border border-paper-400 bg-paper-100 p-3"
      }`}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name (required)"
        maxLength={200}
        className="w-full rounded-lg border border-paper-400 bg-paper-000 px-3 py-2 text-sm focus:border-ember-500 focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        className="min-h-[70px] w-full rounded-lg border border-paper-400 bg-paper-000 px-3 py-2 text-sm focus:border-ember-500 focus:outline-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" size="sm" onClick={submit} disabled={busy}>
        {busy ? "Posting…" : compact ? "Post reply" : "Post comment"}
      </Button>
    </div>
  );
}

function NameModal({
  initialName,
  onConfirm,
  onCancel,
}: {
  initialName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(36,26,18,0.35)] p-4 backdrop-blur-[6px]">
      <div className="w-full max-w-sm space-y-4 rounded-[20px] border border-paper-400 bg-paper-000 p-6 shadow-e3">
        <h3 className="font-heading text-lg text-ink-900">Sign your reaction</h3>
        <p className="text-sm text-ink-500">
          Every reaction and comment in a memoir carries the name of the person
          who left it.
        </p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name (required)"
          maxLength={200}
          className="w-full rounded-lg border border-paper-400 bg-paper-000 px-3 py-2 text-sm focus:border-ember-500 focus:outline-none"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const trimmed = name.trim();
              if (trimmed.length < 2 || trimmed.toLowerCase() === "anonymous") {
                setError("Please enter your real name.");
                return;
              }
              onConfirm(trimmed);
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

function SearchOverlay({
  memoirId,
  onClose,
  onJump,
}: {
  memoirId: string;
  onClose: () => void;
  onJump: (memoryId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchOut | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (query.trim().length < 2) return;
    setBusy(true);
    try {
      const searchResult = await searchBook(memoirId, query.trim());
      setResult(searchResult);
    } catch {
      setResult({ hits: [] });
    }
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(36,26,18,0.35)] p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="mx-auto mt-24 w-full max-w-xl space-y-3 rounded-[20px] border border-paper-400 bg-paper-000 p-5 shadow-e3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Search className="size-4 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void run();
            }}
            placeholder="Search titles, stories and transcripts…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-ink-400 hover:bg-paper-200"
          >
            <X className="size-4" />
          </button>
        </div>
        {busy && <p className="text-sm text-ink-500">Searching…</p>}
        {result && (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {result.hits.length === 0 && (
              <p className="text-sm text-ink-500">Nothing in this book matches yet.</p>
            )}
            {result.hits.map((hit) => (
              <button
                key={hit.memory_id}
                type="button"
                onClick={() => onJump(hit.memory_id)}
                className="block w-full rounded-lg border border-paper-400 bg-paper-100 p-3 text-left hover:border-ember-500"
              >
                <p className="font-heading text-sm font-medium text-ink-900">
                  {hit.title || "Untitled memory"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-500">{hit.snippet}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AudioPlayer({ src, durationMs }: { src: string; durationMs?: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const element = audioRef.current;
    if (!element) return;
    if (playing) {
      element.pause();
      return;
    }
    element.play().catch(() => {});
  }

  const totalSeconds = durationMs ? Math.round(durationMs / 1000) : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-paper-400 bg-paper-100/60 p-2.5">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause recording" : "Play recording"}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-600 transition-colors hover:bg-ember-500 hover:text-paper-000"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-paper-400">
        <div
          className="h-full rounded-full bg-ember-500 transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {totalSeconds !== null && (
        <span className="shrink-0 text-xs tabular-nums text-ink-400">
          {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, "0")}
        </span>
      )}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={(event) => {
          setPlaying(false);
          setProgress(0);
          event.currentTarget.currentTime = 0;
        }}
        onTimeUpdate={(event) => {
          const element = event.currentTarget;
          if (element.duration > 0) setProgress(element.currentTime / element.duration);
        }}
      />
    </div>
  );
}