import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  console.log("Middleware test OK");
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
