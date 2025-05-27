"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { LayoutDashboard, BookOpen, Bookmark, Clock, User } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "text-violet-500",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/dashboard/bookmarks",
    color: "text-pink-700",
  },
  {
    label: "Watch Later",
    icon: Clock,
    href: "/dashboard/watch-later",
    color: "text-orange-700",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-emerald-500",
  },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full text-white">
      <div className="px-2 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400",
                isCollapsed && "justify-center"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  isCollapsed ? "flex-1 justify-center" : "flex-1"
                )}
              >
                <route.icon
                  className={cn("h-5 w-5", !isCollapsed && "mr-3", route.color)}
                />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "mt-auto px-2 py-4 border-t border-white/10",
          isCollapsed && "flex justify-center"
        )}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-x-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-zinc-400">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
