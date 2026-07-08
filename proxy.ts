import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
// Unauthenticated requests to these paths are redirected to /sign-in.

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/stats/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Run on every request path EXCEPT:
     * - _next/static  — compiled JS/CSS bundles
     * - _next/image   — image optimisation API
     * - favicon.ico
     * - Static media files (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
