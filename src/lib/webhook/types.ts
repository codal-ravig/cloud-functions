/**
 * Configuration for a webhook provider.
 * Each provider defines how to verify and handle incoming webhooks.
 */
export interface WebhookProviderConfig {
  /** Display name of the provider (e.g., "Stripe", "GitHub") */
  name: string;

  /** Environment variable name that holds the webhook secret */
  secretEnvVar: string;

  /** HTTP header name containing the signature (e.g., "stripe-signature") */
  signatureHeader: string;

  /** The handler function for processing verified webhook events */
  handler: (event: WebhookEvent) => Promise<WebhookHandlerResult>;

  /**
   * Optional custom signature verification function.
   * If not provided, the default HMAC-SHA256 verification is used.
   */
  verifySignature?: (
    payload: string,
    signature: string,
    secret: string
  ) => boolean;
}

/**
 * Parsed webhook event after verification.
 */
export interface WebhookEvent {
  /** Unique event ID (from the provider, or generated) */
  id: string;

  /** Event type (e.g., "checkout.session.completed") */
  type: string;

  /** Provider slug (e.g., "stripe", "github") */
  provider: string;

  /** Parsed JSON payload */
  payload: Record<string, unknown>;

  /** ISO timestamp when the event was received */
  receivedAt: string;

  /** Raw body string (useful for debugging) */
  rawBody: string;
}

/**
 * Result of processing a webhook event.
 */
export interface WebhookHandlerResult {
  /** Whether the event was processed successfully */
  success: boolean;

  /** Human-readable message about the result */
  message: string;

  /** Optional data to include in the response */
  data?: Record<string, unknown>;
}
