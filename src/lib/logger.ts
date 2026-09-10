import pino from "pino";

/**
 * Vercel-optimized structured JSON logger.
 *
 * - In production: outputs JSON (Vercel's log viewer parses it natively)
 * - In development: uses pino-pretty for human-readable output
 *
 * Sensitive fields (token, password, secret, authorization, cookie)
 * are automatically redacted in all environments.
 */

const isProduction = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  // Redact sensitive fields from logs
  redact: {
    paths: [
      "*.token",
      "*.password",
      "*.secret",
      "*.authorization",
      "*.cookie",
      "*.apiKey",
      "headers.authorization",
      "headers.cookie",
      "headers[\"x-api-key\"]",
    ],
    censor: "[REDACTED]",
  },
  // Base fields included in every log entry
  base: {
    service: "cloud-functions",
    environment: process.env.NODE_ENV || "development",
    ...(isVercel && {
      region: process.env.VERCEL_REGION || "unknown",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    }),
  },
  // Pretty print in development for readability
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname,service,environment",
        },
      }
    : undefined,
  // Ensure timestamps are always included
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger scoped to a specific module/component.
 *
 * @example
 * const log = createModuleLogger("webhook-handler");
 * log.info({ provider: "stripe" }, "Processing webhook");
 */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}

export type Logger = pino.Logger;
