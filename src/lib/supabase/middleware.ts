// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Protected routes
//   if (
//     !user &&
//     (request.nextUrl.pathname.startsWith("/dashboard") ||
//       request.nextUrl.pathname.startsWith("/memoirs"))
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   // Redirect authenticated users away from auth pages
//   if (
//     user &&
//     (request.nextUrl.pathname === "/login" ||
//       request.nextUrl.pathname === "/signup")
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/onboarding"; // wizard forwards to /memoirs if nothing is pending
//     return NextResponse.redirect(url);
//   }
// }

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/memoirs"];
const AUTH_PAGES = new Set(["/login", "/signup"]);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() decodes the cookie locally — no round-trip to Supabase Auth.
  // It also refreshes an expiring token and writes the new cookies via setAll.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = Boolean(session?.user);
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isAuthenticated && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && AUTH_PAGES.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding"; // wizard forwards to /memoirs if nothing is pending
    return NextResponse.redirect(url);
  }

  // Always return the response so refreshed auth cookies reach the browser.
  return supabaseResponse;
}