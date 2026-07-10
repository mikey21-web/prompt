import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/benchmark",
  "/showcase",
  "/install",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
  "/s",
  "/embed",
  "/api/webhooks",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export default async function middleware(req: NextRequest) {
  if (!isPublicRoute(req.nextUrl.pathname)) {
    const hasSession =
      req.cookies.get("__session")?.value ||
      req.cookies.get("__Secure-__session")?.value ||
      req.cookies.get("__client_uat")?.value;
    if (!hasSession) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
