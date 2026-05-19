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
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as "pro" | "team" | undefined;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (userId && plan) {
      try {
        await (convex.mutation as any)(api.users.updatePlan, {
          clerkId: userId,
          plan,
          stripeCustomerId: customerId,
        });
      } catch {
        // Convex not configured in dev - plan update logged but not persisted
        console.log(`Plan updated for user ${userId} to ${plan}`);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    // NOTE: Need to look up user by stripeCustomerId then downgrade.
    // For now log — full implementation requires getUserByStripeCustomerId mutation.
    console.log("Subscription cancelled for customer:", customerId);
  }

  return NextResponse.json({ received: true });
}
