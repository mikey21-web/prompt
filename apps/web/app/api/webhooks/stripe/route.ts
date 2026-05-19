import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@promptforge/convex/convex/_generated/api";
import { logger } from "@/lib/logger";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    logger.error("webhook.missing_signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn("webhook.dev_mode_no_secret");
    // In development without a webhook secret, parse the event directly (unsafe - dev only)
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook body" },
        { status: 400 }
      );
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      logger.error("webhook.signature_failed", { err: error });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  }

  // Handle checkout session completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as "pro" | "team" | undefined;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!userId || !plan) {
      logger.error("webhook.missing_metadata", {
        sessionId: session.id,
        userId,
        plan,
      });
      return NextResponse.json({ received: true });
    }

    try {
      logger.info("webhook.checkout_completed", { userId, plan });
      await convex.mutation(api.users.updatePlan, {
        clerkId: userId,
        plan,
        stripeCustomerId: customerId,
      });
      logger.info("webhook.plan_updated", { userId, plan });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      logger.error("webhook.plan_update_failed", { userId, err: error });
      // Continue processing - the webhook should return 200
    }
  }

  // Handle subscription updates (e.g., when invoice is paid)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        logger.info("webhook.invoice_paid", {
          subscriptionId: subscription.id,
          customer:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        logger.error("webhook.subscription_retrieve_failed", { err: error });
      }
    }
  }

  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;

    logger.info("webhook.subscription_cancelled", { customerId });
    // NOTE: To fully implement downgrade on cancellation, add a Convex mutation
    // that looks up user by stripeCustomerId and downgrades to "free" plan.
  }

  return NextResponse.json({ received: true });
}
