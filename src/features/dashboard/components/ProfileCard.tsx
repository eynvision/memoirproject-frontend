import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Memoir } from "@/features/memoir/schemas";
import { PublishButton } from "./PublishButton";

export function ProfileCard({ memoir }: { memoir: Memoir }) {
  const isPublished = memoir.status === "published";

  const initials = memoir.subject_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <section className="rounded-xl border border-paper-400 bg-paper-000 p-7 shadow-e1">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          {/* Monogram tile — derived from the name we already store */}
          <div className="grid size-24 shrink-0 place-items-center rounded-full bg-paper-300 font-heading text-2xl text-ink-500">
            {initials || "?"}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-[28px] text-ink-900">
                {memoir.subject_name}
              </h1>
              <span className="rounded-full border border-paper-400 px-2.5 py-0.5 text-xs font-medium text-ink-500">
                {memoir.subject_is_living ? "Ongoing" : "In loving memory"}
              </span>
              {isPublished && (
                <span className="rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-500">
                  Published
                </span>
              )}
            </div>
            <p className="line-clamp-2 max-w-md text-base leading-relaxed text-ink-500">
              {memoir.description?.trim() ||
                "Start adding memories to tell their story."}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
          {!isPublished && <PublishButton memoirId={memoir.id} />}

          <Link href={`/dashboard/${memoir.id}/settings`}>
            <Button variant="outline">Edit profile</Button>
          </Link>

          {isPublished && (
            <Link href={`/read/${memoir.id}`}>
              <Button>See memoir</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}