// src/features/auth/hooks.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, MemoirCreatePayload } from "@/lib/api/client";
import { LoginInput, SignupInput } from "./schemas";
import { createSession } from "@/app/actions/auth";
import { readStorage } from "@/lib/storage";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // 1. The unified processor that handles both the Memoir and the Memory
  const processPendingMemoir = async () => {
    let activeMemoir = null;

    // STEP A: Create the Memoir if it's pending
    const memoirPayload = readStorage<MemoirCreatePayload>("pending_memoir");
    if (memoirPayload) {
      try {
        const createdMemoir = await api.createMemoir(memoirPayload);
        activeMemoir = createdMemoir.data || createdMemoir;
        
        localStorage.setItem("active_memoir", JSON.stringify(activeMemoir));
        localStorage.removeItem("pending_memoir");
      } catch (err) {
        console.error("Failed to auto-create memoir:", err);
      }
    } else {
      // Fallback: If it was already created, grab it from storage
      activeMemoir = readStorage("active_memoir");
    }

    // STEP B: Create the initial memory if it exists
    const savedMemory = localStorage.getItem("onboarding_initial_memory");
    const savedDate = localStorage.getItem("onboarding_memory_date");
    
    // Generate today's date as a bulletproof fallback
    const today = new Date().toISOString().split("T")[0];
    const finalDate = savedDate || today;
    
    if (savedMemory && activeMemoir && activeMemoir.id) {
      try {
        await api.createMemory({
          memoir_id: activeMemoir.id,
          title: "First Memory",
          body_text: savedMemory,
          
          occurred_start: finalDate,
          occurred_end: finalDate,
          occurred_precision: "day",
          kind: "text",
        });
        localStorage.removeItem("onboarding_initial_memory");
        localStorage.removeItem("onboarding_memory_date");
      } catch (err) {
        console.error("Failed to auto-create initial memory:", err);
      }
    }

    return activeMemoir;
  };
  
  const startAuthAction = () => {
    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (data: LoginInput): Promise<boolean> => {
    startAuthAction();

    try {
      const res = await api.login({
        email: data.email,
        password: data.password,
      });
      const accessToken =
        res.access_token || res.token || res.data?.access_token;
      if (accessToken) {
        await createSession(accessToken);
      }
      // --- SMART MEMOIR CHECK & CREATION LOGIC ---
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check the database: Does this user already have memoirs?
        const memoirs = await api.getUserMemoirs();

        if (!memoirs || memoirs.length === 0) {
          const pendingMemoir =
            readStorage<MemoirCreatePayload>("pending_memoir");

          if (pendingMemoir) {
            const createdMemoir = await api.createMemoir(pendingMemoir);
            const activeMemoir = createdMemoir.data || createdMemoir;

            localStorage.setItem("active_memoir", JSON.stringify(activeMemoir));
            localStorage.removeItem("pending_memoir");

            
            // INSTANTLY CREATE THE ONBOARDING MEMORY
            const savedMemory = localStorage.getItem("onboarding_initial_memory");
            const savedDate = localStorage.getItem("onboarding_memory_date");
            
            const today = new Date().toISOString().split("T")[0];
            const finalDate = savedDate || today;
            
            if (savedMemory && activeMemoir && activeMemoir.id) {
              try {
                await api.createMemory({
                  memoir_id: activeMemoir.id,
                  title: "First Memory",
                  body_text: savedMemory,
                  
                  occurred_start: finalDate,
                  occurred_end: finalDate,
                  occurred_precision: "day",
                  kind: "text",
                });
                // Wipe it so it doesn't accidentally trigger again later
                localStorage.removeItem("onboarding_initial_memory");
                localStorage.removeItem("onboarding_memory_date");
              } catch (err) {
                console.error("Failed to auto-create initial memory:", err);
              }
            }
            // ==========================================

          } else {
            // Edge case: Logged in, no memoirs in DB, AND skipped onboarding.
            // Silently redirect to start onboarding naturally.
            router.push("/memory-subject-selection");
            return false;
          }
        } else {
          // MEMOIRS EXIST: Load their existing memoir.
          localStorage.setItem("active_memoir", JSON.stringify(memoirs[0]));
          localStorage.removeItem("pending_memoir");
          
          // Failsafe: Just in case a returning user went through onboarding again
          const savedMemory = localStorage.getItem("onboarding_initial_memory");
          const savedDate = localStorage.getItem("onboarding_memory_date");
          
          const today = new Date().toISOString().split("T")[0];
          const finalDate = savedDate || today;
          
          if (savedMemory && memoirs[0] && memoirs[0].id) {
              try {
                await api.createMemory({
                  memoir_id: memoirs[0].id,
                  title: "First Memory",
                  body_text: savedMemory,
                  
                  occurred_start: finalDate,
                  occurred_end: finalDate,
                  occurred_precision: "day",
                  kind: "text",
                });
                localStorage.removeItem("onboarding_initial_memory");
                localStorage.removeItem("onboarding_memory_date");
              } catch {}
          }
        }
      } catch (memoirCheckError) {
        console.error(
          "Could not verify or create memoir during login",
          memoirCheckError,
        );
      }
      // ------------------------------------------

      // 3. Everything is ready, send them to the dashboard
      router.push("/dashboard");
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during login";
      setServerError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (
    data: SignupInput & { confirmPassword?: string },
  ): Promise<boolean> => {
    startAuthAction();

    try {
      const res = await api.signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      const accessToken =
        res.access_token || res.token || res.data?.access_token;
      if (accessToken) {
        await createSession(accessToken);
        await processPendingMemoir();
        return true;
      } else {
        setSuccessMessage(
          "Account created successfully! Please check your email to verify your account.",
        );
        return false;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during signup";
      setServerError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    serverError,
    successMessage,
    setServerError,
    setSuccessMessage,
    handleLogin,
    handleSignup,
  };
}