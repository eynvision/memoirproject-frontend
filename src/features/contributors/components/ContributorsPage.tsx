"use client";

import { Button } from "@/components/ui/button";
import { useContributorsQuery } from "@/features/contributors/hooks";

export function ContributorsPage({ memoirId }: { memoirId: string }) {
  const { data: contributors = [], isLoading, isError, refetch } =
    useContributorsQuery(memoirId);

  if (isLoading) {
    return <p className="py-24 text-center text-ink-500">Loading contributors…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-4 py-24 text-center">
        <p className="text-destructive">Couldn&apos;t load contributors.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-[28px] text-ink-900">Contributors</h1>
        <p className="mt-1 text-[15px] text-ink-500">
          People who can contribute stories to this memoir.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-paper-400 bg-paper-000 shadow-e1">
        {/* Header and cells share the same grid + padding, so columns align */}
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] bg-paper-200 px-6 py-3 text-[13px] font-medium text-ink-500">
          <span>Contributor</span>
          <span>Role</span>
          <span>Status</span>
        </div>

        {contributors.length === 0 ? (
          <div className="border-t border-paper-400 px-6 py-10 text-sm text-ink-500">
            No contributors have been added yet.
          </div>
        ) : (
          contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-t border-paper-400 px-6 py-4 text-[15px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper-300 text-xs font-medium uppercase text-ink-500">
                  {(contributor.email || contributor.display_name || "?").charAt(0)}
                </span>
                <span className="min-w-0 truncate text-ink-700">
                  {contributor.email || contributor.display_name}
                </span>
              </div>
              <span className="text-ink-500">{contributor.role}</span>
              <span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    contributor.status === "Accepted"
                      ? "bg-moss-100 text-moss-500"
                      : "bg-ochre-100 text-ochre-500"
                  }`}
                >
                  {contributor.status}
                </span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}