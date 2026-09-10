import { NextRequest, NextResponse } from "next/server";
import { createRequestContext, getDuration } from "@/lib/request-context";
import { getProvider, getRegisteredProviders } from "@/lib/webhook/registry";
import { verifyWebhookSignature } from "@/lib/webhook/verify";
import type { WebhookEvent } from "@/lib/webhook/types";

/**
 * @swagger
 * /api/webhooks/{provider}:
 *   post:
 *     summary: Webhook receiver
 *     description: Processes incoming webhooks for a specific provider
 *     tags:
 *       - Webhooks
 *     security:
 *       - WebhookSignature: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: The provider slug (e.g., example, stripe, github)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The raw webhook payload
 *     responses:
 *       200:
 *         description: Webhook event processed successfully
 *       400:
 *         description: Bad request (invalid body or JSON)
 *       401:
 *         description: Unauthorized (missing or invalid signature)
 *       404:
 *         description: Provider not found
 *       422:
 *         description: Webhook handler reported failure
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerSlug } = await params;
  const ctx = createRequestContext(request);

  ctx.log.info(
    { provider: providerSlug },
    "Incoming webhook request"
  );

  // ── 1. Look up provider ───────────────────────────────────────
  const providerConfig = getProvider(providerSlug);

  if (!providerConfig) {
    ctx.log.warn(
      {
        provider: providerSlug,
        registeredProviders: getRegisteredProviders(),
        duration: getDuration(ctx),
      },
      "Unknown webhook provider"
    );
    return NextResponse.json(
      {
        error: "Unknown webhook provider",
        provider: providerSlug,
        registeredProviders: getRegisteredProviders(),
      },
      { status: 404 }
    );
  }

  // ── 2. Read raw body ──────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await request.text();
    ctx.log.debug(
      { bodyLength: rawBody.length },
      "Raw body read successfully"
    );
  } catch (error) {
    ctx.log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to read request body"
    );
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 }
    );
  }

  // ── 3. Verify signature ───────────────────────────────────────
  const signature = request.headers.get(providerConfig.signatureHeader);
  const secret = process.env[providerConfig.secretEnvVar];

  if (!secret) {
    ctx.log.error(
      { envVar: providerConfig.secretEnvVar },
      "Webhook secret not configured — check environment variables"
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!signature) {
    ctx.log.warn(
      { header: providerConfig.signatureHeader },
      "Missing signature header"
    );
    return NextResponse.json(
      {
        error: "Missing signature header",
        expectedHeader: providerConfig.signatureHeader,
      },
      { status: 401 }
    );
  }

  // Use custom verification if provided, otherwise default HMAC-SHA256
  const verify = providerConfig.verifySignature || verifyWebhookSignature;
  const isValid = verify(rawBody, signature, secret);

  if (!isValid) {
    ctx.log.error(
      { provider: providerSlug, duration: getDuration(ctx) },
      "Webhook signature verification failed"
    );
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  ctx.log.info("Signature verified successfully");

  // ── 4. Parse payload ──────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    ctx.log.error("Failed to parse webhook payload as JSON");
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // ── 5. Construct event ────────────────────────────────────────
  const event: WebhookEvent = {
    id:
      (payload.id as string) ||
      (payload.event_id as string) ||
      crypto.randomUUID(),
    type:
      (payload.type as string) ||
      (payload.event as string) ||
      (payload.action as string) ||
      "unknown",
    provider: providerSlug,
    payload,
    receivedAt: new Date().toISOString(),
    rawBody,
  };

  ctx.log.info(
    {
      eventId: event.id,
      eventType: event.type,
      provider: event.provider,
    },
    "Webhook event constructed"
  );

  // ── 6. Handle event ───────────────────────────────────────────
  try {
    const result = await providerConfig.handler(event);

    const logData = {
      eventId: event.id,
      eventType: event.type,
      provider: providerSlug,
      success: result.success,
      message: result.message,
      duration: getDuration(ctx),
    };

    if (result.success) {
      ctx.log.info(logData, "Webhook event processed successfully");
    } else {
      ctx.log.warn(logData, "Webhook handler reported failure");
    }

    return NextResponse.json(
      {
        received: true,
        eventId: event.id,
        success: result.success,
        message: result.message,
        ...(result.data && { data: result.data }),
      },
      { status: result.success ? 200 : 422 }
    );
  } catch (error) {
    ctx.log.error(
      {
        eventId: event.id,
        eventType: event.type,
        provider: providerSlug,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: getDuration(ctx),
      },
      "Unhandled error in webhook handler"
    );

    return NextResponse.json(
      {
        error: "Internal server error",
        eventId: event.id,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/webhooks/{provider}:
 *   get:
 *     summary: Get webhook provider info
 *     description: Returns configuration information for a specific webhook provider. Useful for connectivity testing.
 *     tags:
 *       - Webhooks
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: The provider slug (e.g., example)
 *     responses:
 *       200:
 *         description: Provider information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provider:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 status:
 *                   type: string
 *                 signatureHeader:
 *                   type: string
 *                 endpoint:
 *                   type: string
 *       404:
 *         description: Provider not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerSlug } = await params;
  const ctx = createRequestContext(request);

  const providerConfig = getProvider(providerSlug);

  if (!providerConfig) {
    ctx.log.debug({ provider: providerSlug }, "GET on unknown provider");
    return NextResponse.json(
      {
        error: "Unknown provider",
        registeredProviders: getRegisteredProviders(),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    provider: providerConfig.name,
    slug: providerSlug,
    status: "active",
    signatureHeader: providerConfig.signatureHeader,
    endpoint: `/api/webhooks/${providerSlug}`,
  });
}
