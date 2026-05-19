import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder",
  {
    apiVersion: "2024-06-20",
  }
);

export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_pro_placeholder",
  team: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "price_team_placeholder",
};

export async function createCheckoutSession({
  userId,
  email,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  plan: "pro" | "team";
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    metadata: { userId, plan },
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) throw new Error("Checkout session creation failed");
  return session.url;
}
