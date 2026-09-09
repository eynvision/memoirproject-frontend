"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMemoir } from "@/features/memoir/hooks";
import type {
  RelationshipGroup,
  WizardFormValues,
} from "@/features/memoir/schemas";
import { isApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/client";
import {
  clearPendingOnboarding,
  loadPendingOnboarding,
  savePendingOnboarding,
  type PendingOnboarding,
} from "@/features/memoir/pending-store";

const RELATIONS: { label: string; value: RelationshipGroup }[] = [
  { label: "Parent", value: "parent" },
  { label: "Grandparent", value: "grandchild" },
  { label: "Spouse", value: "spouse_partner" },
  { label: "Sibling", value: "sibling" },
  { label: "Friend", value: "friend" },
  { label: "Other", value: "other" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";
  const create = useCreateMemoir();
  const supabase = useMemo(() => createClient(), []);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [relationship, setRelationship] = useState<RelationshipGroup | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<PendingOnboarding | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const inFlightRef = useRef(false);
  const autoCreateAttemptedRef = useRef(false);

  const { register, handleSubmit, watch, setValue } = useForm<WizardFormValues>({
    mode: "onChange",
    defaultValues: {
      relationship: null,
      subject_name: "",
      birth_year: "",
      is_living: true,
      end_year: "",
    },
  });

  const isLiving = watch("is_living");
  const subjectName = watch("subject_name");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      const pending = loadPendingOnboarding();
      if (pending) {
        setRelationship(pending.relationship);
        setStep(2);
        setValue("relationship", pending.relationship);
        setValue("subject_name", pending.subject_name);
        setValue("birth_year", pending.birth_year);
        setValue("is_living", pending.is_living);
        setValue("end_year", pending.end_year);
      }

      let userExists = false;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userExists = Boolean(user);
      } catch {
        userExists = false;
      }

      if (cancelled) return;

      if (userExists && !pending && !forceNew) {
        router.replace("/memoirs");
        return;
      }

      setAuthenticated(userExists);
      if (userExists && pending) {
        setPendingCreate(pending);
      }
      setHydrated(true);
    }
    void initialize();
    return () => {
      cancelled = true;
    };
  }, [forceNew, router, setValue, supabase]);

  const createWorkspace = useCallback(
    async (data: PendingOnboarding) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setCreateError(null);
      try {
        const memoir = await create.mutateAsync({
          relationship: data.relationship,
          subject_name: data.subject_name,
          is_living: data.is_living,
          birth_year: data.birth_year ? Number.parseInt(data.birth_year, 10) : null,
          end_year: !data.is_living && data.end_year ? Number.parseInt(data.end_year, 10) : null,
        });
        clearPendingOnboarding();
        setPendingCreate(null);
        router.push(`/dashboard/${memoir.id}`);
      } catch (error) {
        const errorMsg = isApiError(error) 
          ? error.message 
          : "Unable to create the memoir. Please try again.";
        
        // If the backend reports the user account is missing, the auth session is out of sync.
        // Sign out and redirect to signup to force a clean re-sync of the user_account row.
        if (errorMsg.includes("User account is not initialized")) {
          await supabase.auth.signOut();
          savePendingOnboarding(data);
          router.push("/signup");
          return;
        }
        
        setCreateError(errorMsg);
      } finally {
        inFlightRef.current = false;
      }
    },
    [create, router, supabase]
  );

  useEffect(() => {
    if (!hydrated || !authenticated || !pendingCreate || autoCreateAttemptedRef.current) {
      return;
    }
    autoCreateAttemptedRef.current = true;
    void createWorkspace(pendingCreate);
  }, [authenticated, createWorkspace, hydrated, pendingCreate]);

  async function onSubmit(data: WizardFormValues) {
    if (!relationship) return;
    
    const pending: PendingOnboarding = {
      relationship,
      subject_name: data.subject_name.trim(),
      birth_year: data.birth_year,
      is_living: data.is_living,
      end_year: data.end_year,
    };

    let userExists = false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userExists = Boolean(user);
    } catch {
      userExists = false;
    }

    if (!userExists) {
      savePendingOnboarding(pending);
      router.push("/signup");
      return;
    }

    setAuthenticated(true);
    await createWorkspace(pending);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-[8vh] pb-24">
      <div className="mb-10 flex items-center justify-center gap-3">
        <StepDot n={1} active={step === 1} />
        <span
          className={`h-0.5 w-14 rounded-full transition-colors ${
            step === 2 ? "bg-brass-500" : "bg-paper-400"
          }`}
        />
        <StepDot n={2} active={step === 2} />
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10 text-center">
          <div className="space-y-3">
            <h1 className="font-heading text-4xl text-ink-900 md:text-[40px]">
              Who is this memoir for?
            </h1>
            <p className="text-[17px] text-ink-500">
              Choose your relationship to the person whose memories you&apos;re preserving.
            </p>
          </div>
          <div className="mx-auto grid max-w-[600px] grid-cols-2 gap-4 md:grid-cols-3">
            {RELATIONS.map((rel) => (
              <button
                key={rel.value}
                type="button"
                onClick={() => {
                  setRelationship(rel.value);
                  setValue("relationship", rel.value);
                }}
                className={`min-h-[72px] rounded-xl border px-4 py-6 text-base font-medium transition-all ${
                  relationship === rel.value
                    ? "border-ember-500 bg-ember-100 text-ink-900 shadow-e1"
                    : "border-paper-400 bg-paper-000 text-ink-500 hover:border-ink-300 hover:text-ink-700"
                }`}
              >
                {rel.label}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            className="h-12 px-10"
            disabled={!relationship}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="animate-in fade-in slide-in-from-bottom-4 space-y-8"
        >
          <div className="text-center">
            <h1 className="font-heading text-4xl text-ink-900 md:text-[40px]">
              Tell us about them
            </h1>
          </div>
          <div className="mx-auto w-full max-w-[480px] space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject_name" className="text-sm font-medium text-ink-700">
                Their name
              </Label>
              <Input
                id="subject_name"
                {...register("subject_name", { required: true })}
                placeholder="e.g. Amina Khan"
                className="h-12 bg-paper-000 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_year" className="text-sm font-medium text-ink-700">
                Year of birth
              </Label>
              <Input
                id="birth_year"
                {...register("birth_year")}
                type="number"
                min={1800}
                max={2100}
                placeholder="e.g. 1948"
                className="h-12 bg-paper-000"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-ink-700">
                Their story continues until
              </Label>
              <div className="space-y-4 rounded-xl border border-paper-400 bg-paper-000 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="lifespan"
                    className="size-5 accent-ember-500"
                    checked={isLiving}
                    onChange={() => setValue("is_living", true)}
                  />
                  <span className="font-medium text-ink-700">Present day</span>
                </label>
                <label className="flex cursor-pointer flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="lifespan"
                      className="size-5 accent-ember-500"
                      checked={!isLiving}
                      onChange={() => setValue("is_living", false)}
                    />
                    <span className="font-medium text-ink-700">A specific year</span>
                  </div>
                  {!isLiving && (
                    <Input
                      {...register("end_year")}
                      type="number"
                      min={1800}
                      max={2100}
                      placeholder="e.g. 2005"
                      className="h-11 bg-paper-100 text-center"
                    />
                  )}
                </label>
              </div>
            </div>

            {createError && (
              <div
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {createError}
              </div>
            )}

            {authenticated && pendingCreate && !createError && (
              <p className="text-center text-sm text-ink-500 animate-pulse">
                Your account is ready. Creating your memoir workspace…
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setStep(1)}
              disabled={create.isPending}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8"
              disabled={!subjectName.trim() || create.isPending || !hydrated}
            >
              {create.isPending ? "Creating…" : "Create workspace"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function StepDot({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={`grid size-7 place-items-center rounded-full text-sm font-medium transition-colors ${
        active ? "bg-ink-900 text-paper-000" : "bg-paper-300 text-ink-400"
      }`}
    >
      {n}
    </span>
  );
}