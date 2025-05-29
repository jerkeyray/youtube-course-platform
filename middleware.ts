import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    console.log("Middleware test OK", { url: req.url });
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        console.log("Unauthorized access to dashboard");
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
      console.log("Authenticated user:", userId);
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
