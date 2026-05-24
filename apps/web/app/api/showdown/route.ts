import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@promptforge/convex/convex/_generated/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/**
 * REST shim for Convex `promptforge.showdown` action.
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
    if (
      !body ||
      typeof body.input !== "string" ||
      !Array.isArray(body.targets)
    ) {
      return NextResponse.json(
        { error: "Body must be { input: string, targets: string[] }" },
        { status: 400, headers: cors }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return NextResponse.json(
        { error: "Convex not configured" },
        { status: 500, headers: cors }
      );
    }
    
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    const token = await getToken({ template: "convex" });
    if (token) convex.setAuth(token);
    const result = await convex.action(api.promptforge.showdown, {
      input: body.input,
      targets: body.targets,
    });
    logger.info("showdown.api", { userId, n: body.targets.length });
    return NextResponse.json(result, { headers: cors });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Showdown failed";
    logger.error("showdown.api.error", { err: msg });
    return NextResponse.json({ error: msg }, { status: 500, headers: cors });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed =
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("moz-extension://") ||
    origin.endsWith(".vercel.app") ||
    origin === process.env.NEXT_PUBLIC_APP_URL;
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}
