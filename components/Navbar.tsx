"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isSignedIn } = useUser();

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-background h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold">Course Platform</h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {isSignedIn ? (
          <div className="flex items-center gap-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
              }}
            />
          </div>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
