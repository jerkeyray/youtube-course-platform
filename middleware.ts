import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers for specific access control
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Define the type for user metadata
interface UserMetadata {
  role?: string;
  [key: string]: any;
}

export default clerkMiddleware(
  async (auth, req) => {
    // Log the incoming request details immediately
    console.log("🔍 Request details:", {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      nextUrl: req.nextUrl?.toString(),
    });

    try {
      // Get auth information - now properly awaited
      const authResult = await auth();
      console.log("🔑 Auth result:", {
        hasUserId: !!authResult.userId,
        hasSessionClaims: !!authResult.sessionClaims,
        hasGetToken: !!authResult.getToken,
      });

      const { userId, getToken, sessionClaims } = authResult;

      // Debugging: Log request details
      if (process.env.NODE_ENV === "development") {
        console.log("Middleware: Processing", req.url);
        console.log("User ID:", userId);
        console.log("Session Claims:", sessionClaims);
      }

      // Check 1: Allow public routes without authentication
      if (isPublicRoute(req)) {
        console.log("✅ Public route access:", req.url);
        return NextResponse.next();
      }

      // Check 2: Ensure user is authenticated for protected routes
      if (!userId && isProtectedRoute(req)) {
        console.log("🔒 Protected route access denied:", req.url);
        // Redirect unauthenticated users to sign-in page
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Check 3: Restrict admin routes to users with 'admin' role
      if (isAdminRoute(req)) {
        const metadata = sessionClaims?.metadata as UserMetadata | undefined;
        const role = metadata?.role;
        if (role !== "admin") {
          console.log("👮 Admin route access denied:", req.url);
          // Redirect non-admin users to homepage or unauthorized page
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Check 4: Ensure JWT token is valid for API routes
      if (req.nextUrl.pathname.startsWith("/api")) {
        try {
          const token = await getToken();
          if (!token) {
            console.log("🔑 API route access denied - no token:", req.url);
            return NextResponse.json(
              { error: "Unauthorized: No valid token" },
              { status: 401 }
            );
          }
        } catch (tokenError) {
          console.error("🔑 Token error:", tokenError);
          return NextResponse.json(
            { error: "Token validation failed" },
            { status: 401 }
          );
        }
      }

      // Allow the request to proceed if all checks pass
      console.log("✅ Request allowed:", req.url);
      return NextResponse.next();
    } catch (error) {
      // Enhanced error logging
      console.error("❌ Middleware error details:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
      });

      // For development, return error details
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            error: "Middleware error",
            details:
              error instanceof Error
                ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                  }
                : "Unknown error",
            url: req.url,
          },
          { status: 500 }
        );
      }

      // For production, redirect to error page or return generic error
      return NextResponse.redirect(new URL("/error", req.url));
    }
  },
  { debug: true }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
