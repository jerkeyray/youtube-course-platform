"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { DashboardSidebarToggle } from "@/components/DashboardSidebarToggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const isCoursePage = pathname?.includes('/courses/') && pathname.match(/\/courses\/[^\/]+$/);

  // Show loading state for page transitions
  useEffect(() => {
    const handleStart = () => setIsPageLoading(true);
    const handleComplete = () => setIsPageLoading(false);

    // Listen for route changes
    window.addEventListener("beforeunload", handleStart);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, []);

  if (!session && status !== "loading") {
    redirect("/api/auth/signin");
  }

  return (
    <div className="h-full relative bg-black min-h-screen">
      {/* Desktop Sidebar - Hidden during loading */}
      {status !== "loading" && (
        <div
          className={cn(
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#0A0A0A] border-r border-white/5 transition-all duration-200 ease-in-out",
            isCollapsed ? "md:w-16" : "md:w-64",
            isCoursePage && "opacity-50"
          )}
        >
          <div className="flex items-center h-16 px-6 border-b border-white/5">
            <DashboardSidebarToggle
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed(!isCollapsed)}
            />
            {!isCollapsed && (
              <Link
                href="/"
                className="text-xl font-medium tracking-tighter text-white ml-3 hover:text-neutral-300 transition-colors duration-200"
              >
                yudoku
              </Link>
            )}
          </div>
          <DashboardSidebar isCollapsed={isCollapsed} />
        </div>
      )}

      {/* Mobile Navigation - Hidden during loading */}
      {status !== "loading" && (
        <div className="md:hidden">
          <MobileNav />
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200 ease-in-out bg-black min-h-screen",
          status === "loading"
            ? "md:pl-0"
            : isCollapsed
            ? "md:pl-16"
            : "md:pl-64"
        )}
      >
        <div className="h-full min-h-screen bg-black">
          {status !== "loading" && <div className="md:hidden h-14" />}{" "}
          {/* Spacer for mobile nav */}
          <AnimatePresence mode="wait">
            {status === "loading" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LoadingScreen />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
