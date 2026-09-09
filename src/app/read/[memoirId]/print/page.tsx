// src/app/read/[memoirId]/print/page.tsx
import { notFound } from "next/navigation";
import { getOwnerBook, getPublicBookByMemoir } from "@/features/reader/queries";
import { isApiError } from "@/lib/api/errors";
import { formatDate } from "@/utils/date";

export default async function PrintMemoirPage({
  params,
}: {
  params: Promise<{ memoirId: string }>;
}) {
  const { memoirId } = await params;
  let book;
  try {
    book = await getOwnerBook(memoirId);
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) {
      try {
        book = await getPublicBookByMemoir(memoirId);
      } catch {
        notFound();
      }
    } else {
      notFound();
    }
  }

  if (!book) notFound();

  const birthYear = book.memoir.subject_born_on
    ? new Date(book.memoir.subject_born_on).getFullYear()
    : null;
  const endYear = book.memoir.subject_died_on
    ? new Date(book.memoir.subject_died_on).getFullYear()
    : book.memoir.subject_is_living
    ? "Present"
    : null;

  return (
    <div className="bg-white p-8 text-black">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{book.memoir.subject_name}</h1>
        <p className="mt-2 text-xl">A Memoir</p>
        <p className="mt-4 text-sm">
          {birthYear && <>Born: {birthYear}. </>}
          {endYear && !book.memoir.subject_is_living && <>Died: {endYear}. </>}
          {book.memoir.subject_is_living && <>Their story continues today. </>}
        </p>
        {book.memoir.description && (
          <p className="mt-4 italic">{book.memoir.description}</p>
        )}
      </div>

      {book.chapters.map((chapter, index) => (
        <div key={chapter.id ?? index} className="mb-12 break-before-page">
          <h2 className="mb-6 text-2xl font-bold border-b-2 border-black pb-2">
            Chapter {index + 1}: {chapter.title}
          </h2>
          {chapter.summary && <p className="mb-4 italic">{chapter.summary}</p>}
          
          {chapter.memories.map((memory) => (
            <div key={memory.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-3">{memory.title || "Untitled"}</h3>
              {memory.body_text && (
                <p className="mb-4 whitespace-pre-line leading-relaxed">{memory.body_text}</p>
              )}
              {memory.transcript && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-300">
                  <p className="text-sm font-semibold mb-1">Transcript:</p>
                  <p className="text-sm whitespace-pre-line">{memory.transcript}</p>
                </div>
              )}
              {memory.media.filter(m => m.kind === "photo").map(photo => (
                <figure key={photo.id} className="mb-4">
                  <img
                    src={photo.playback_url}
                    alt={photo.caption || ""}
                    className="max-w-full h-auto border border-gray-300"
                  />
                  {photo.caption && (
                    <figcaption className="text-xs text-gray-600 mt-1 text-center">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="mt-12 pt-8 border-t-2 border-black text-center">
        <h2 className="text-2xl font-bold mb-4">Epilogue</h2>
        <p className="italic">
          A life is kept by the people who tell it. Thank you for reading, for
          remembering, and for adding your own line to this story.
        </p>
        <p className="mt-8 text-xs text-gray-500">
          Generated on {formatDate(new Date())}
        </p>
      </div>
    </div>
  );
}