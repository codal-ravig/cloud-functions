import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware that injects a correlation ID into every request.
 *
 * This runs at the edge BEFORE the request hits your API routes.
 * The x-request-id header is then available in your route handlers
 * for consistent log correlation.
 */
export function middleware(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") || crypto.randomUUID();

  // Clone the request headers and add the correlation ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Create response with the modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set the correlation ID on the response for debugging
  response.headers.set("x-request-id", requestId);

  return response;
}

/**
 * Only run middleware on API routes.
 * Skip static files, images, favicon, etc.
 */
export const config = {
  matcher: ["/api/:path*"],
};
