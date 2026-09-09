import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ memoirId: string }>;
}) {
  await params;
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper-100 p-6 text-center">
      <h1 className="font-heading text-3xl text-ink-900">You&apos;ve been invited!</h1>
      <p className="max-w-md text-ink-500">
        Please sign in or create an account to contribute your stories and photos to this memoir.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Sign up</Button>
        </Link>
      </div>
    </main>
  );
}