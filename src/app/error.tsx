"use client";

// /**
//  * Route-level error boundary.
//  *
//  * Catches anything thrown while rendering a route — including an `ApiError`
//  * raised by a server-path fetch. Error boundaries must be client components,
//  * which is why this file carries the directive while the pages it protects
//  * do not.
//  *
//  * Place additional `error.tsx` files in nested segments when a section of the
//  * app should fail without taking the whole route with it.
//  */

// import { useEffect } from "react";

// import { Button } from "@/components/ui/button";
// import { isApiError } from "@/lib/api/errors";

// export default function RouteError({
//   error,
//   reset,
// }: {
//   error: Error & { digest?: string };
//   reset: () => void;
// }) {
//   useEffect(() => {
//     // Replace with your logging service. Server-thrown errors reach the client
//     // with their message redacted and only `digest` intact — that digest is
//     // what correlates this UI with the full stack trace in the server logs.
//     console.error(error);
//   }, [error]);

//   const description = isApiError(error)
//     ? error.message
//     : "Something went wrong while loading this page.";

//   return (
//     <main className="mx-auto flex w-full max-w-md flex-col items-start gap-4 px-6 py-24">
//       <h1 className="text-2xl font-semibold tracking-tight">
//         {isApiError(error) && error.code === "network"
//           ? "Backend unavailable"
//           : "Something went wrong"}
//       </h1>
//       <p className="text-muted-foreground">{description}</p>
//       {error.digest && (
//         <p className="font-mono text-xs text-muted-foreground">
//           digest: {error.digest}
//         </p>
//       )}
//       <Button onClick={reset}>Try again</Button>
//     </main>
//   );
// }
