"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

import { BookOpen, Bookmark, User, LogOut, Home } from "lucide-react";

const learningRoutes = [
  {
    label: "Home",
    icon: Home,
    href: "/home",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/home/mycourses",
  },
];

const toolRoutes = [
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/home/bookmarks",
  },
  {
    label: "Profile",
    icon: User,
    href: "/home/profile",
  },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full justify-between py-6">
      {/* Navigation Routes */}
      <div className="space-y-1 px-3">
        {/* Learning section */}
        <div className="space-y-1">
          {learningRoutes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-x-3 text-sm px-3 py-2.5 transition-colors duration-150 relative group",
                  isActive
                    ? "text-white font-medium"
                    : "text-neutral-400 hover:text-neutral-300 font-normal",
                  isCollapsed ? "justify-center px-2" : ""
                )}
              >
                {/* Background for active and hover */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-md transition-colors",
                    isActive
                      ? "bg-white/8"
                      : "bg-transparent group-hover:bg-white/5"
                  )}
                />
                <route.icon
                  className={cn(
                    "h-4 w-4 relative z-10 transition-opacity",
                    isActive
                      ? "text-white opacity-100"
                      : "text-neutral-400 group-hover:text-neutral-300 group-hover:opacity-100 opacity-90"
                  )}
                />
                {!isCollapsed && (
                  <span className="relative z-10">{route.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-2" />

        {/* Tools section */}
        <div className="space-y-1">
          {toolRoutes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-x-3 text-sm px-3 py-2.5 transition-colors duration-150 relative group",
                  isActive
                    ? "text-white font-medium"
                    : "text-neutral-400 hover:text-neutral-300 font-normal",
                  isCollapsed ? "justify-center px-2" : ""
                )}
              >
                {/* Background for active and hover */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-md transition-colors",
                    isActive
                      ? "bg-white/8"
                      : "bg-transparent group-hover:bg-white/5"
                  )}
                />
                <route.icon
                  className={cn(
                    "h-4 w-4 relative z-10 transition-opacity",
                    isActive
                      ? "text-white opacity-100"
                      : "text-neutral-400 group-hover:text-neutral-300 group-hover:opacity-100 opacity-90"
                  )}
                />
                {!isCollapsed && (
                  <span className="relative z-10">{route.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section - Profile */}
      <div className="px-3 pt-2">
        {/* Profile Section with Dropdown */}
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-x-3 text-sm px-3 py-2.5 text-neutral-400 w-full transition-colors duration-150 hover:bg-white/5 hover:text-neutral-300 h-auto relative group",
                  isCollapsed
                    ? "justify-center rounded-md px-2"
                    : "rounded-md justify-start"
                )}
              >
                {session.user.image ? (
                  <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-white/10">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-medium ring-1 ring-white/10">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <p className="text-sm truncate max-w-[120px]">
                      {session.user.name || "User"}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? "center" : "start"}
              side="top"
              className="w-56 mb-2 z-[90] bg-[#0A0A0A] border border-white/10 text-neutral-400"
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
