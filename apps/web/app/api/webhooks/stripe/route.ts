import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@promptforge/convex/convex/_generated/api";
import type Stripe from "stripe";

export const dynamic = 'force-dynamic';

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Webhook error: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not configured - webhook verification disabled");
    // In development without a webhook secret, parse the event directly (unsafe - for dev only)
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
      console.error("Webhook signature verification failed:", error);
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
      console.error("Missing userId or plan in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      console.log(`Processing checkout for user ${userId}, plan: ${plan}`);
      await convex.mutation(api.users.updatePlan, {
        clerkId: userId,
        plan,
        stripeCustomerId: customerId,
      });
      console.log(`Successfully updated plan for user ${userId} to ${plan}`);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to update plan for user ${userId}:`, error);
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
        console.log(
          `Invoice paid for subscription ${subscription.id}, customer: ${subscription.customer}`
        );
        // Plan update is already handled by checkout.session.completed
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to retrieve subscription:", error);
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

    console.log(`Subscription cancelled for customer: ${customerId}`);
    // NOTE: To fully implement downgrade on cancellation, we need a mutation
    // that looks up user by stripeCustomerId and downgrades to "free" plan.
    // For now, we log the cancellation.
  }

  return NextResponse.json({ received: true });
}
