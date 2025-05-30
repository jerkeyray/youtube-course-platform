"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardSidebarToggleProps {
  _isCollapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebarToggle({
  onToggle,
}: DashboardSidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full hover:bg-transparent"
      onClick={onToggle}
    >
      <Menu className="h-5 w-5 text-white" />
    </Button>
  );
}
