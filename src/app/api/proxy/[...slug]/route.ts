import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Vercel reads this from the build output to set the function's execution cap.
export const maxDuration = 60;

const ATTEMPT_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;

// A timeout means the request may have reached the backend, so retrying risks
// double-submitting. Any other failure (connection refused, DNS, TLS) means the
// backend never saw the request, so retrying is safe.
function isTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === "TimeoutError";
}

async function proxyOnce(
  targetUrl: string,
  method: string,
  headers: Headers,
  body: string | undefined,
): Promise<NextResponse> {
  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
  });
}

// Updated signature: params is now a Promise in modern Next.js
async function handleProxy(
  request: NextRequest,
  props: { params: Promise<{ slug: string[] }> },
) {
  // 1. Await the params first
  const params = await props.params;
  const path = params.slug.join("/");
  const searchParams = request.nextUrl.searchParams.toString();

  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        detail:
          "NEXT_PUBLIC_API_BASE_URL is not set, so the backend cannot be reached.",
      },
      { status: 500 },
    );
  }

  const targetUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

  // 2. Await the cookies() function before calling .get()
  const cookieStore = await cookies();
  const token = cookieStore.get("memoir_access_token")?.value;

  const headers = new Headers(request.headers);
  headers.delete("host"); // Allow fetch to set the correct host for FastAPI
  // The session travels in the Authorization header; don't also forward it
  // as a cookie to a third-party service.
  headers.delete("cookie");

  // Securely attach the token for the backend
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Read the body once — request.text() can only be called a single time, so
  // it must happen before the retry loop.
  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await proxyOnce(targetUrl, request.method, headers, body);
    } catch (error) {
      unstable_rethrow(error);
      lastError = error;

      if (isTimeout(error) || attempt === MAX_ATTEMPTS) break;
    }
  }

  console.error("Proxy error:", lastError);
  return NextResponse.json(
    { detail: "Internal Server Proxy Error" },
    { status: 500 },
  );
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
