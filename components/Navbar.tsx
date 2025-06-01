"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-white h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">yudoku</h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {isSignedIn ? (
          <div className="flex items-center gap-x-4">
            <Button
              variant="outline"
              asChild
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:text-blue-800 font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-600">{session.user?.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              asChild
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
