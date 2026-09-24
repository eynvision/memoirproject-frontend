// src/features/auth/hooks.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { LoginInput, SignupInput } from "./schemas";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const processPendingMemoir = async () => {
    const pendingMemoirData = localStorage.getItem("pending_memoir");
    if (pendingMemoirData) {
      try {
        const memoirPayload = JSON.parse(pendingMemoirData);
        const createdMemoir = await api.createMemoir(memoirPayload);
        localStorage.setItem("active_memoir", JSON.stringify(createdMemoir));
        localStorage.removeItem("pending_memoir");
      } catch (err) {
        console.error("Failed to auto-create memoir during onboarding:", err);
      }
    }
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

      const accessToken = res.access_token || res.token || res.data?.access_token;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        await processPendingMemoir(); // FIX: Added pending memoir creation for logging in
      }

      // Recover this user's active memoir (there is no cache for a
      // returning login, only for the signup+onboarding flow).
      try {
        const memoirs = await api.getMyMemoirs();
        if (memoirs.length > 0) {
          localStorage.setItem("active_memoir", JSON.stringify({ data: memoirs[0] }));
        }
      } catch (memoirErr) {
        console.error("Failed to fetch active memoir after login:", memoirErr);
      }

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
    data: SignupInput & { confirmPassword?: string }
  ): Promise<boolean> => {
    startAuthAction();

    try {
      const res = await api.signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      const accessToken = res.access_token || res.token || res.data?.access_token;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        await processPendingMemoir();
      }

      setSuccessMessage(
        "Account created successfully! Please proceed to log in."
      );
      setTimeout(() => router.push("/login"), 2000);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred during signup";
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