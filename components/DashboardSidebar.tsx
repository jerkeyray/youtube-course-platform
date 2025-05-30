"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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
    color: "text-sky-500",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "text-violet-500",
  },
  {
    label: "Notes",
    icon: Pencil,
    href: "/dashboard/notes",
    color: "text-emerald-500",
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
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full py-4">
      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-sm font-medium px-3 py-2 hover:bg-white/10 transition-all duration-200",
              pathname === route.href
                ? "text-white bg-white/10"
                : "text-zinc-400",
              isCollapsed && "justify-center"
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
