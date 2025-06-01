"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-blue-900 text-white hover:bg-blue-800 hover:text-blue-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[280px] sm:w-[320px] bg-gradient-to-b from-blue-900 to-blue-950 dark:from-[#050C20] dark:to-[#081030] border-r border-blue-700/30"
      >
        <SheetHeader className="px-4 py-3 border-b border-blue-700/30">
          <SheetTitle className="text-xl font-bold text-blue-100">
            yudoku
          </SheetTitle>
        </SheetHeader>
        <div className="text-white">
          <DashboardSidebar isCollapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
