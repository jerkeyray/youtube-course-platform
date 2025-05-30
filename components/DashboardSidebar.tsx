"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Clock,
  User,
  Pencil,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "text-blue-500",
  },
  {
    label: "Notes",
    icon: Pencil,
    href: "/dashboard/notes",
    color: "text-blue-500",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/dashboard/bookmarks",
    color: "text-blue-500",
  },
  {
    label: "Watch Later",
    icon: Clock,
    href: "/dashboard/watch-later",
    color: "text-blue-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-blue-500",
  },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-4">
      <div className="space-y-1 px-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-sm font-medium px-3 py-2 transition-all duration-200",
              pathname === route.href
                ? "text-white bg-blue-600/80 border-l-4 border-blue-400"
                : "text-zinc-200 hover:bg-blue-500/20",
              isCollapsed ? "justify-center rounded-lg mx-1" : "rounded-r-lg"
            )}
          >
            <route.icon className={cn("h-5 w-5", route.color)} />
            {!isCollapsed && <p>{route.label}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
