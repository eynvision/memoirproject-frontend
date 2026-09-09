import "server-only";
import { apiRequestServer } from "@/lib/api/server";
import { bookOutSchema } from "./schemas";

export async function getPublicBook(token: string) {
  return apiRequestServer({
    path: `/public/book/${token}`,
    schema: bookOutSchema,
    cache: "no-store",
  });
}

export async function getPublicBookByMemoir(memoirId: string) {
  return apiRequestServer({
    path: `/public/memoirs/${memoirId}/book`,
    schema: bookOutSchema,
    cache: "no-store",
  });
}

export async function getOwnerBook(memoirId: string) {
  return apiRequestServer({
    path: `/memoirs/${memoirId}/book`,
    schema: bookOutSchema,
    cache: "no-store",
  });
}