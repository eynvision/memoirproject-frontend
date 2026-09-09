import { Suspense } from "react";
import { OnboardingWizard } from "@/features/memoir/components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-paper-100">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-ink-500">Loading workspace...</div>}>
        <OnboardingWizard />
      </Suspense>
    </main>
  );
}