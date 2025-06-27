"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

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
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900 border-r border-zinc-800 transition-all duration-200 ease-in-out",
            isCollapsed ? "md:w-16" : "md:w-52"
          )}
        >
          <div className="flex items-center h-14 px-4 border-b border-zinc-800">
            <DashboardSidebarToggle
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed(!isCollapsed)}
            />
            {!isCollapsed && (
              <Link
                href="/"
                className="text-xl font-bold text-white ml-2 hover:text-blue-400 transition-colors duration-200 ease-in-out"
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
            : "md:pl-52"
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
