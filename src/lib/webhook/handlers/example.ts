import { createModuleLogger } from "../../logger";
import type { WebhookEvent, WebhookHandlerResult } from "../types";

const log = createModuleLogger("webhook-handler-example");

/**
 * Example webhook handler demonstrating the handler pattern.
 *
 * Replace this with your actual business logic.
 * Each handler receives a verified WebhookEvent and returns a result.
 */
export async function exampleHandler(
  event: WebhookEvent
): Promise<WebhookHandlerResult> {
  log.info(
    {
      eventId: event.id,
      eventType: event.type,
      provider: event.provider,
    },
    "Processing example webhook event"
  );

  // ── Route by event type ──────────────────────────────────────
  switch (event.type) {
    case "ping":
      log.info("Received ping event — responding with pong");
      return {
        success: true,
        message: "pong",
      };

    case "test.event":
      log.info(
        { payload: event.payload },
        "Received test event with payload"
      );
      return {
        success: true,
        message: "Test event processed successfully",
        data: { received: event.payload },
      };

    case "order.created":
      log.info(
        { orderId: event.payload.orderId },
        "Processing new order"
      );
      // TODO: Add your order processing logic here
      // e.g., save to database, send confirmation email, etc.
      return {
        success: true,
        message: `Order ${event.payload.orderId || "unknown"} processed`,
      };

    default:
      log.warn(
        { eventType: event.type },
        "Received unhandled event type — acknowledging anyway"
      );
      return {
        success: true,
        message: `Event type '${event.type}' acknowledged but not handled`,
      };
  }
}
