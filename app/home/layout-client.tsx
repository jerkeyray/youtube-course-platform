"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { DashboardSidebarToggle } from "@/components/DashboardSidebarToggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "next-auth";

interface HomeLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function HomeLayoutClient({
  children,
  session,
}: HomeLayoutClientProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isCoursePage =
    pathname?.includes("/courses/") && pathname.match(/\/courses\/[^\/]+$/);

  // Load collapsed state from local storage
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (storedCollapsed !== null) {
      setIsCollapsed(storedCollapsed === "true");
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="h-full relative bg-black min-h-screen">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#0A0A0A] transition-all duration-200 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-64",
          isCoursePage && "opacity-50"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16",
            isCollapsed ? "px-0 justify-center" : "px-3"
          )}
        >
          <DashboardSidebarToggle
            isCollapsed={isCollapsed}
            onToggle={handleSidebarToggle}
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
        <DashboardSidebar isCollapsed={isCollapsed} session={session} />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav session={session} />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-200 ease-in-out bg-black min-h-screen",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <div className="h-full min-h-screen bg-black">
          <div className="md:hidden h-14" />
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
