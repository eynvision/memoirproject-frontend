import { notFound } from "next/navigation";
import { BookView } from "@/features/reader/components/BookView";
import { getOwnerBook, getPublicBookByMemoir } from "@/features/reader/queries";
import { isApiError } from "@/lib/api/errors";

export default async function ReadMemoirPage({
  params,
}: {
  params: Promise<{ memoirId: string }>;
}) {
  const { memoirId } = await params;

  try {
    const book = await getOwnerBook(memoirId);
    return <BookView book={book} mode="owner" memoirId={memoirId} />;
  } catch (error) {
    // Anonymous or non-owner readers get 401/403 from the owner endpoint;
    // they are served the public book instead of a 404.
    if (isApiError(error) && (error.status === 401 || error.status === 403)) {
      try {
        const book = await getPublicBookByMemoir(memoirId);
        return <BookView book={book} mode="public" memoirId={memoirId} />;
      } catch (publicError) {
        if (isApiError(publicError) && publicError.status === 404) {
          notFound();
        }
        throw publicError;
      }
    }
    if (isApiError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }
}