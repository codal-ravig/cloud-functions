import { NextRequest, NextResponse } from "next/server";
import { createRequestContext, getDuration } from "@/lib/request-context";

/**
 * @swagger
 * /api/extensions/algolia-sync:
 *   post:
 *     summary: Elastic Path to Algolia Sync Extension
 *     description: Acts as a debug and pass-through layer for product batches before they are sent to Algolia. Logs the exact payload and returns it unmodified.
 *     tags:
 *       - Extensions
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The batch of products from Elastic Path
 *     responses:
 *       200:
 *         description: Returns the unmodified payload
 *       400:
 *         description: Invalid JSON payload
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  const ctx = createRequestContext(request);

  // 1. Authenticate using the header specified in the Elastic Path UI
  const authHeaderName = "x-api-key"; 
  const expectedApiKey = process.env.ALGOLIA_SYNC_API_KEY;
  const providedApiKey = request.headers.get(authHeaderName);

  if (!expectedApiKey) {
    ctx.log.error("ALGOLIA_SYNC_API_KEY is not configured in environment variables");
    return NextResponse.json(
      { error: "Server misconfiguration - Missing API Key" }, 
      { status: 500 }
    );
  }

  if (providedApiKey !== expectedApiKey) {
    ctx.log.warn(
      { providedApiKey },
      "Unauthorized request to Algolia sync extension"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Read, Log, and Pass-through Payload
  try {
    const payload = await request.json();

    // Log the payload as 'syncData' so you can inspect it in Vercel logs
    ctx.log.info(
      { 
        extension: "elastic-path-algolia",
        payloadSize: JSON.stringify(payload).length,
        duration: getDuration(ctx),
        syncData: payload // <--- This will dump the exact JSON received into the logs
      },
      "Algolia sync batch received and logged successfully"
    );

    // 3. Return the exact payload unmodified to continue the sync
    return NextResponse.json(payload);

  } catch (error) {
    ctx.log.error(
      { error: error instanceof Error ? error.message : String(error) }, 
      "Failed to parse Algolia sync payload"
    );
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
