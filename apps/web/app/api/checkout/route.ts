import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/billing";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user || !user.emailAddresses[0]) {
    return NextResponse.json({ error: "No email on file" }, { status: 400 });
  }

  const { plan } = await req.json();
  if (plan !== "pro" && plan !== "team") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createCheckoutSession({
      userId,
      email: user.emailAddresses[0].emailAddress,
      plan,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
      cancelUrl: `${appUrl}/pricing`,
    });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
