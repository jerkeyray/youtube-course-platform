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
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-slate-800 bg-[#0D1117]/95 backdrop-blur-sm h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            yudoku
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {isSignedIn ? (
          <div className="flex items-center gap-x-4">
            <Button
              variant="outline"
              asChild
              className="bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-600 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-slate-200">
                {session.user?.name}
              </p>
              <p className="text-xs text-slate-400">{session.user?.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-slate-800"
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
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-slate-700"
              >
                <DropdownMenuItem
                  asChild
                  className="text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
                >
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-slate-800 focus:bg-slate-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
