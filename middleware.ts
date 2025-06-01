import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/auth");

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Public routes that don't require authentication
  const isPublicRoute =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/favicon.ico");

  // Protected routes that require authentication
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  // If user is not authenticated and trying to access protected routes, redirect to sign-in
  if (!isAuthenticated && isProtectedRoute) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

// Match routes for auth middleware
export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
