import { NextResponse } from "next/server";
import { createModuleLogger } from "@/lib/logger";
import { getRegisteredProviders } from "@/lib/webhook/registry";

const log = createModuleLogger("health");

const startTime = Date.now();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API Health Check
 *     description: Returns the uptime and current version of the application
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: string
 *                   example: 123s
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 providers:
 *                   type: array
 *                   items:
 *                     type: string
 */
export async function GET() {
  const uptime = Math.round((Date.now() - startTime) / 1000);

  log.debug({ uptime }, "Health check hit");

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    environment: process.env.NODE_ENV || "development",
    providers: getRegisteredProviders(),
  });
}
