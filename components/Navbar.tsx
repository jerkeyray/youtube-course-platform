"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          Yuco
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {!isLoaded ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full focus:outline-none"
              >
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName ?? "Profile"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
                    {user.fullName?.charAt(0) ?? "U"}
                  </div>
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-background p-2 shadow-lg">
                  <div className="mb-2 border-b px-2 pb-2">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {user.primaryEmailAddress?.emailAddress}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href="/sign-in">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}