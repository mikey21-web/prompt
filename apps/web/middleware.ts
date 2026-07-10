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
  "/s(.*)",
  "/embed(.*)",
  "/api/webhooks(.*)",
]);

export default async function middleware(req: NextRequest) {
  try {
    return clerkMiddleware((auth, req) => {
      if (!isPublicRoute(req) && !auth().userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
      return NextResponse.next();
    })(req);
  } catch {
    const hasSession =
      req.cookies.get("__session")?.value ||
      req.cookies.get("__Secure-__session")?.value ||
      req.cookies.get("__client_uat")?.value;
    if (!isPublicRoute(req) && !hasSession) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
