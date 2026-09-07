import Link from "next/link";

import type { Memory } from "@/features/memory/schemas";
import { formatDate } from "@/utils/date";

export function NewestMemories({
  memoirId,
  memories,
}: {
  memoirId: string;
  memories: Memory[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-paper-400 bg-paper-000 shadow-e1">
      <h2 className="px-6 pt-5 font-heading text-lg text-ink-900">
        Newest memories
      </h2>

      <div className="mt-3">
        {memories.length === 0 ? (
          <div className="border-t border-paper-400 px-6 py-8 text-sm text-ink-500">
            No memories yet. Add the first one from the Memories tab.
          </div>
        ) : (
          memories.map((memory) => (
            <article
              key={memory.id}
              className="border-t border-paper-400 px-6 py-4"
            >
              <h3 className="font-heading text-base text-ink-900">
                {memory.title || "Untitled memory"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-ink-500">
                {memory.body_text || "No description"}
              </p>
              <p className="mt-2 text-xs tabular-nums text-ink-400">
                By you · {formatDate(memory.created_at)}
              </p>
            </article>
          ))
        )}
      </div>

      <div className="flex justify-end border-t border-paper-400 px-6 py-4">
        <Link
          href={`/dashboard/${memoirId}/memories`}
          className="text-sm font-medium text-ember-600 transition-colors hover:text-ember-500"
        >
          See all memories →
        </Link>
      </div>
    </section>
  );
}