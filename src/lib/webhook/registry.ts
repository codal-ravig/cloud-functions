import type { WebhookProviderConfig } from "./types";
import { exampleHandler } from "./handlers/example";

/**
 * Registry of all webhook providers.
 *
 * To add a new provider:
 * 1. Create a handler in ./handlers/<provider>.ts
 * 2. Register it here with its config
 *
 * The key is the URL slug used in /api/webhooks/[provider]
 */
const registry = new Map<string, WebhookProviderConfig>();

// ── Register Providers ──────────────────────────────────────────

registry.set("example", {
  name: "Example",
  secretEnvVar: "WEBHOOK_SECRET_EXAMPLE",
  signatureHeader: "x-webhook-signature",
  handler: exampleHandler,
});

// To add more providers, follow this pattern:
//
// registry.set("stripe", {
//   name: "Stripe",
//   secretEnvVar: "WEBHOOK_SECRET_STRIPE",
//   signatureHeader: "stripe-signature",
//   handler: stripeHandler,
//   verifySignature: stripeVerify,  // optional custom verification
// });
//
// registry.set("github", {
//   name: "GitHub",
//   secretEnvVar: "WEBHOOK_SECRET_GITHUB",
//   signatureHeader: "x-hub-signature-256",
//   handler: githubHandler,
// });

// ── Exports ─────────────────────────────────────────────────────

/**
 * Get a webhook provider config by its URL slug.
 */
export function getProvider(
  slug: string
): WebhookProviderConfig | undefined {
  return registry.get(slug.toLowerCase());
}

/**
 * Get all registered provider slugs.
 */
export function getRegisteredProviders(): string[] {
  return Array.from(registry.keys());
}
