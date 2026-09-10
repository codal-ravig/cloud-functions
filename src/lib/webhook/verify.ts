import { createHmac, timingSafeEqual } from "crypto";
import { createModuleLogger } from "../logger";

const log = createModuleLogger("webhook-verify");

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * This is the default verification method used by most webhook providers
 * (GitHub, Shopify, custom webhooks). Providers with non-standard
 * verification (like Stripe) should provide a custom `verifySignature`
 * function in their provider config.
 *
 * @param payload - Raw request body string
 * @param signature - Signature from the webhook header
 * @param secret - Webhook secret for HMAC computation
 * @returns true if the signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Compute expected signature
    const expectedSignature = createHmac("sha256", secret)
      .update(payload, "utf-8")
      .digest("hex");

    // Handle signatures that may have a prefix like "sha256="
    const cleanSignature = signature.includes("=")
      ? signature.split("=").pop()!
      : signature;

    // Use timing-safe comparison to prevent timing attacks
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(cleanSignature, "hex");

    if (expected.length !== received.length) {
      log.warn(
        {
          expectedLength: expected.length,
          receivedLength: received.length,
        },
        "Signature length mismatch"
      );
      return false;
    }

    const isValid = timingSafeEqual(expected, received);

    if (!isValid) {
      log.warn("Webhook signature verification failed");
    } else {
      log.debug("Webhook signature verified successfully");
    }

    return isValid;
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Error during signature verification"
    );
    return false;
  }
}
