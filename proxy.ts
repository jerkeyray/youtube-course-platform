import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/auth");

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  // Protected routes that require authentication
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/home");

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
    // Only run auth middleware where it's needed:
    // - protect /home
    // - redirect logged-in users away from /sign-in and /auth
    "/home/:path*",
    "/sign-in/:path*",
    "/auth/:path*",
  ],
};
