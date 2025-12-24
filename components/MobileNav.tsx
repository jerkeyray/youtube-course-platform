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
import { Session } from "next-auth";

interface MobileNavProps {
  session: Session | null;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-blue-400 border border-zinc-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[280px] sm:w-[320px] bg-zinc-900 border-r border-zinc-800"
      >
        <SheetHeader className="px-4 py-3 border-b border-zinc-800">
          <SheetTitle className="text-xl font-bold text-white">
            yudoku
          </SheetTitle>
        </SheetHeader>
        <div className="text-white">
          <DashboardSidebar isCollapsed={false} session={session} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
