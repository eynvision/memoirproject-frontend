import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Edit3, Image as ImageIcon, Sparkles, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged in -> memoir list. Logged out -> onboarding wizard.
  const ctaHref = user ? "/memoirs" : "/onboarding";

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="px-8 py-6">
        <h1 className="font-heading text-[22px] font-medium text-ink-900">
          Memoir
        </h1>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <section className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="max-w-xl space-y-6">
            <h2 className="font-heading text-5xl leading-[1.08] text-ink-900 md:text-[56px]">
              Everyone deserves to be remembered.
            </h2>
            <p className="max-w-[44ch] text-lg leading-relaxed text-ink-500">
              Bring together the stories, photographs, voices, and moments —
              and turn them into something worth keeping for generations.
            </p>
            <Link href={ctaHref} className="inline-block">
              <Button size="lg" className="h-12 rounded-lg px-6 text-base">
                Let&apos;s start preserving
              </Button>
            </Link>
          </div>

          <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl bg-paper-200 shadow-e3">
            <Image
              src="/Couple.png"
              alt="Family memory"
              fill
              sizes="(max-width: 1024px) 100vw, 512px"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mt-24">
          <h3 className="text-center font-heading text-3xl text-ink-900">
            How we preserve memories
          </h3>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ProcessCard number="01" icon={Edit3} title="Create your workspace" />
            <ProcessCard
              number="02"
              icon={ImageIcon}
              title="Invite members to contribute memories"
            />
            <ProcessCard number="03" icon={Sparkles} title="AI agents organize memories" />
            <ProcessCard number="04" icon={BookOpen} title="Get your memoir" />
          </div>
        </section>
      </main>
    </div>
  );
}

function ProcessCard({
  number,
  icon: Icon,
  title,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-paper-400 bg-paper-000 p-6 text-center shadow-e1 transition-shadow hover:shadow-e2">
      <span className="text-xs tabular-nums text-ink-400">{number}</span>
      <Icon className="size-7 text-ink-500" strokeWidth={1.5} />
      <h4 className="text-base font-medium leading-snug text-ink-700">{title}</h4>
    </div>
  );
}