import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@promptforge/convex/convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/**
 * Public REST shim around the `promptforge.translate` Convex action.
 * Exists so the browser extension and external API users can call us
 * without speaking the Convex protocol directly.
 *
 * Auth: Clerk session cookie (works first-party for the web app, and
 * works for the extension because Chrome forwards cookies on
 * cross-origin fetch when credentials: "include" is set).
 */
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);

  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: cors }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.input !== "string") {
      return NextResponse.json(
        { error: "Body must be { input: string, target?: string }" },
        { status: 400, headers: cors }
      );
    }

    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return NextResponse.json(
        { error: "Convex not configured" },
        { status: 500, headers: cors }
      );
    }

    // Dynamically import to avoid build-time issues
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Forward Clerk JWT to Convex so ctx.auth.getUserIdentity() resolves
    const token = await getToken({ template: "convex" });
    if (token) convex.setAuth(token);

    const result = await convex.action(api.promptforge.translate, {
      input: body.input,
      target: body.target,
    });

    logger.info("forge.api.translate", { userId });
    return NextResponse.json(result, { headers: cors });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Forge failed";
    logger.error("forge.api.error", { err: msg });
    return NextResponse.json({ error: msg }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  // Allow our extension (chrome-extension://...) and the AI host sites so
  // the page-level fetch from inject.ts works.
  const allowed =
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("moz-extension://") ||
    origin === "https://chatgpt.com" ||
    origin === "https://chat.openai.com" ||
    origin === "https://claude.ai" ||
    origin === "https://gemini.google.com" ||
    origin.endsWith(".vercel.app") ||
    origin === process.env.NEXT_PUBLIC_APP_URL;

  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://chatgpt.com",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}
