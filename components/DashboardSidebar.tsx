"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Bookmark, Clock, User } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500 dark:text-sky-400",
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/dashboard/mycourses",
    color: "text-violet-500 dark:text-violet-400",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/dashboard/bookmarks",
    color: "text-pink-700 dark:text-pink-500",
  },
  {
    label: "Watch Later",
    icon: Clock,
    href: "/dashboard/watch-later",
    color: "text-orange-700 dark:text-orange-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
    color: "text-emerald-500 dark:text-emerald-400",
  },
]

interface DashboardSidebarProps {
  isCollapsed: boolean
}

export function DashboardSidebar({ isCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full text-white bg-gradient-to-b from-slate-900 to-blue-900 dark:from-slate-950 dark:to-blue-950">
      <div className="px-2 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10 dark:bg-white/5" : "text-zinc-400 dark:text-zinc-500",
                isCollapsed && "justify-center",
              )}
            >
              <div className={cn("flex items-center", isCollapsed ? "flex-1 justify-center" : "flex-1")}>
                <route.icon className={cn("h-5 w-5", !isCollapsed && "mr-3", route.color)} />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
