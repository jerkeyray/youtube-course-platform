"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardSidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebarToggle({
  onToggle,
}: DashboardSidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="group h-10 w-10 rounded-full bg-transparent text-neutral-400 hover:bg-transparent hover:text-neutral-200 transition-colors duration-200"
      onClick={onToggle}
    >
      <Menu className="h-5 w-5 transition-colors duration-200" />
    </Button>
  );
}
