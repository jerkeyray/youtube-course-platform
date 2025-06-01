"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { DashboardSidebarToggle } from "@/components/DashboardSidebarToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="h-full relative">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-gradient-to-b from-slate-900 to-slate-950 dark:from-[#020617] dark:to-[#0f172a] transition-all duration-200 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-52"
        )}
      >
        <div className="flex items-center h-14 px-4">
          <DashboardSidebarToggle
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
          {!isCollapsed && (
            <Link
              href="/"
              className="text-xl font-bold text-slate-100 ml-2 hover:text-slate-300 transition-opacity duration-200 ease-in-out"
            >
              yudoku
            </Link>
          )}
        </div>
        <DashboardSidebar isCollapsed={isCollapsed} />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200 ease-in-out bg-background",
          isCollapsed ? "md:pl-16" : "md:pl-52"
        )}
      >
        <div className="h-full p-4 md:p-8">
          <div className="md:hidden h-14" /> {/* Spacer for mobile nav */}
          {children}
        </div>
      </main>
    </div>
  );
}
