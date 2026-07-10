import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  // Public share pages (with their own OG image route)
  "/s/(.*)",
  // Public embed (iframe-able for blogs/newsletters)
  "/embed(.*)",
  // Webhooks must remain public; the API auth happens inside the route
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    try {
      const a = await auth();
      if (!a.userId) {
        return Response.redirect(new URL('/sign-in', req.url));
      }
    } catch {
      // Clerk auth unavailable (dev-mode domain restriction, key mismatch, etc.)
      // Redirect to sign-in instead of crashing with MIDDLEWARE_INVOCATION_FAILED
      return Response.redirect(new URL('/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
