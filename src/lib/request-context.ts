import { NextRequest } from "next/server";
import { logger, type Logger } from "./logger";

export interface RequestContext {
  /** Unique correlation ID for tracing this request across logs */
  correlationId: string;
  /** Child logger scoped to this request */
  log: Logger;
  /** Start time for duration tracking */
  startTime: number;
  /** HTTP method */
  method: string;
  /** Request URL pathname */
  pathname: string;
}

/**
 * Create a request context with a correlation ID and scoped logger.
 *
 * The correlation ID is extracted from the `x-request-id` header
 * (set by our middleware) or generated as a fallback.
 *
 * @example
 * const ctx = createRequestContext(request);
 * ctx.log.info({ eventType: "order.created" }, "Processing webhook");
 * // ... later
 * ctx.log.info({ duration: getDuration(ctx) }, "Request completed");
 */
export function createRequestContext(req: NextRequest): RequestContext {
  const correlationId =
    req.headers.get("x-request-id") || crypto.randomUUID();
  const method = req.method;
  const pathname = new URL(req.url).pathname;

  const log = logger.child({
    correlationId,
    method,
    pathname,
    userAgent: req.headers.get("user-agent") || "unknown",
  });

  return {
    correlationId,
    log,
    startTime: performance.now(),
    method,
    pathname,
  };
}

/**
 * Get the elapsed duration in milliseconds since the request started.
 */
export function getDuration(ctx: RequestContext): number {
  return Math.round(performance.now() - ctx.startTime);
}
