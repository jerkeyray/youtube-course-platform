// middleware.ts
import { clerkMiddleware, auth } from "@clerk/nextjs/server";

export default clerkMiddleware(
  async (auth, req) => {
    // Get auth information
    const { userId, sessionId } = await auth();

    // Debug logging for authentication state
    console.log("🔒 Auth Debug:", {
      isSignedIn: !!userId,
      userId,
      sessionId,
      requestUrl: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });

    // You can add custom middleware logic here
    // For example, you could check specific routes or add custom headers
    if (req.url.includes("/api/")) {
      console.log("📡 API Request detected");
    }

    // You can also add custom headers for debugging
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(
      "x-debug-auth",
      userId ? "authenticated" : "unauthenticated"
    );

    return new Response(null, {
      headers: requestHeaders,
    });
  },
  { debug: true }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
