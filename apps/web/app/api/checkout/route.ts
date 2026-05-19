import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/billing";
import { checkoutLimiter, identifyRequest } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by user id when authed, fall back to IP
    const identifier = userId || identifyRequest(req);
    const { success, limit, remaining, reset } =
      await checkoutLimiter.limit(identifier);
    if (!success) {
      logger.warn("checkout.ratelimited", { userId, identifier });
      const res = NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
      res.headers.set("X-RateLimit-Limit", String(limit));
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      res.headers.set("X-RateLimit-Reset", String(reset));
      return res;
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses[0]) {
      return NextResponse.json({ error: "No email on file" }, { status: 400 });
    }

    const body = await req.json();
    const { plan } = body;

    if (plan !== "pro" && plan !== "team") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    logger.info("checkout.start", { userId, plan });
    const url = await createCheckoutSession({
      userId,
      email: user.emailAddresses[0].emailAddress,
      plan,
      successUrl: `${appUrl}/billing?success=true`,
      cancelUrl: `${appUrl}/billing?canceled=true`,
    });
    logger.info("checkout.created", { userId, plan });
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    logger.error("checkout.error", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
