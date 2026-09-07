"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth";

const tabs = [
  { label: "Memoir", href: "" },
  { label: "Memories", href: "/memories" },
  { label: "Contributors", href: "/contributors" },
  { label: "Settings", href: "/settings" },
] as const;

export function DashboardNav({ memoirId }: { memoirId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${memoirId}`;

  return (
    <header className="border-b border-paper-400 bg-paper-100 px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <span className="font-heading text-lg text-ink-900">Memoir</span>

          <nav className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const href = `${base}${tab.href}`;
              const active =
                tab.href === ""
                  ? pathname === base || pathname === `${base}/`
                  : pathname.startsWith(href);

              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[15px] font-medium transition-colors",
                    active
                      ? "bg-paper-200 text-ink-900"
                      : "text-ink-500 hover:bg-paper-200/70 hover:text-ink-700",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}