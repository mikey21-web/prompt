import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/benchmark",
  "/showcase",
  "/install",
  "/privacy",
  "/terms",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/s/(.*)",
  "/embed(.*)",
  "/api/webhooks(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    try {
      const a = await auth();
      if (!a.userId) {
        return Response.redirect(new URL("/sign-in", req.url));
      }
    } catch {
      return Response.redirect(new URL("/sign-in", req.url));
    }
  }
});

export default async function middleware(req: NextRequest, event: any) {
  try {
    const resp = await clerk(req, event);
    return resp ?? NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
