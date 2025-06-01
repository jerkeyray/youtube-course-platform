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

import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Clock,
  User,
  Pencil,
  LogOut,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-slate-400",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "text-slate-400",
  },
  {
    label: "Notes",
    icon: Pencil,
    href: "/dashboard/notes",
    color: "text-slate-400",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/dashboard/bookmarks",
    color: "text-slate-400",
  },
  {
    label: "Watch Later",
    icon: Clock,
    href: "/dashboard/watch-later",
    color: "text-slate-400",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-slate-400",
  },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full justify-between py-4">
      {/* Navigation Routes */}
      <div className="space-y-1 px-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-sm font-medium px-3 py-2 transition-all duration-200",
              pathname === route.href
                ? "text-white bg-slate-700/80 border-l-4 border-slate-400"
                : "text-slate-200 hover:bg-slate-800/60",
              isCollapsed ? "justify-center rounded-lg mx-1" : "rounded-r-lg"
            )}
          >
            <route.icon className={cn("h-5 w-5", route.color)} />
            {!isCollapsed && <p>{route.label}</p>}
          </Link>
        ))}
      </div>

      {/* Bottom Section - Profile */}
      <div className="space-y-2 px-2">
        {/* Profile Section with Dropdown */}
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-x-2 text-sm font-medium px-3 py-2 text-slate-200 w-full transition-all duration-200",
                  isCollapsed
                    ? "justify-center rounded-lg mx-1 h-12 w-12"
                    : "rounded-r-lg justify-start"
                )}
              >
                {session.user.image ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <p className="text-sm text-slate-200 truncate max-w-[120px]">
                      {session.user.name || "User"}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? "center" : "start"}
              side="top"
              className="w-56 mb-2 z-[90]"
            >
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
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
