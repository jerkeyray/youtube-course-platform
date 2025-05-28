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
          className="fixed top-4 left-4 z-50 bg-[#111827] text-white hover:bg-[#1f2937] hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[280px] sm:w-[320px] bg-[#111827] border-r border-white/10"
      >
        <SheetHeader className="px-4 py-3 border-b border-white/10">
          <SheetTitle className="text-xl font-bold text-white">
            Yudoku
          </SheetTitle>
        </SheetHeader>
        <div className="text-white">
          <DashboardSidebar isCollapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
