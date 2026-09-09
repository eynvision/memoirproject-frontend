import { notFound } from "next/navigation";
import { BookView } from "@/features/reader/components/BookView";
import { getPublicBook } from "@/features/reader/queries";
import { isApiError } from "@/lib/api/errors";

export const metadata = {
  title: "A Memoir",
  description: "A published family memoir, open to everyone with the link.",
};

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const book = await getPublicBook(token);
    return <BookView book={book} mode="public" memoirId={book.memoir.id} />;
  } catch (error) {
    if (isApiError(error) && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }
}