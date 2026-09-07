import type { Metadata } from "next";

import { DashboardNav } from "@/features/dashboard/components/DashboardNav";

export const metadata: Metadata = {
  title: "Memoir",
  description:
    "Preserve stories, photographs, voices, and moments for generations.",
};

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ memoirId: string }>;
}>) {
  const { memoirId } = await params;

  return (
    <div className="min-h-screen bg-paper-100 font-sans text-ink-700 antialiased">
      <DashboardNav memoirId={memoirId} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}