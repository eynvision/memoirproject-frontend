"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "memoir_access_token";

export async function createSession(token: string) {
  // Await the cookies object first (Required in newer Next.js versions)
  const cookieStore = await cookies(); 
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}