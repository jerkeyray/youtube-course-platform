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
      className="h-10 w-10 rounded-full hover:bg-blue-500/20 transition-all duration-200"
      onClick={onToggle}
    >
      <Menu className="h-5 w-5 text-blue-400" />
    </Button>
  );
}
