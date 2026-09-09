// src/app/memoirs/page.tsx
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMemoirs } from "@/features/memoir/server";
import { signOut } from "@/features/auth";
import { formatDate } from "@/utils/date";
import type { Memoir } from "@/features/memoir/schemas";

export default async function MemoirsPage() {
  let memoirs: Memoir[] = [];
  let fetchError = false;

  try {
    memoirs = await getMemoirs();
  } catch (e) {
    fetchError = true;
  }

  return (
    <main className="min-h-screen bg-paper-100">
      <header className="flex items-center justify-between border-b border-paper-400 px-8 py-5">
        <h1 className="font-heading text-[22px] font-medium text-ink-900">
          Memoir
        </h1>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-ink-900">Your memoirs</h2>
            <p className="mt-1 text-[15px] text-ink-500">
              Open a memoir to continue preserving its story.
            </p>
          </div>
          <Link href="/onboarding?new=1">
            <Button>
              <Plus className="size-4" /> Create new memoir
            </Button>
          </Link>
        </div>

        {fetchError ? (
          <div className="mt-16 flex flex-col items-center gap-5 rounded-xl border border-paper-400 bg-paper-000 p-16 text-center shadow-e1">
            <p className="font-heading text-2xl text-destructive">
              Could not load your memoirs
            </p>
            <p className="text-ink-500">Please check your connection and try again.</p>
          </div>
        ) : memoirs.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-5 rounded-xl border border-paper-400 bg-paper-000 p-16 text-center shadow-e1">
            <BookOpen className="size-10 text-ink-300" strokeWidth={1.5} />
            <p className="font-heading text-2xl text-ink-900">
              You haven&apos;t created a memoir yet
            </p>
            <Link href="/onboarding?new=1">
              <Button size="lg" className="mt-2 px-6">
                Create your first memoir
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {memoirs.map((memoir) => {
              const isPublished = memoir.status === "published";
              const targetUrl = isPublished ? `/read/${memoir.id}` : `/dashboard/${memoir.id}`;
              return (
                <div
                  key={memoir.id}
                  className="flex h-full flex-col justify-between rounded-xl border border-paper-400 bg-paper-000 p-6 shadow-e1 transition-shadow hover:shadow-e2"
                >
                  <Link href={targetUrl} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-lg text-ink-900">
                        {memoir.subject_name}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isPublished
                              ? "bg-moss-100 text-moss-500"
                              : "bg-ochre-100 text-ochre-500"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-ink-500">
                      {memoir.description?.trim() ||
                        "Start adding memories to tell their story."}
                    </p>
                  </Link>
                  <div className="mt-5 flex items-center justify-between border-t border-paper-400 pt-4">
                    <p className="text-xs tabular-nums text-ink-400">
                      Created {formatDate(memoir.created_at)}
                    </p>
                    {isPublished && (
                      <Link href={targetUrl}>
                        <Button size="sm" variant="outline">
                          See memoir
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}