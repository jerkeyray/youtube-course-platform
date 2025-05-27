"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function StreakDisplay() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // TODO: Implement streak calculation based on user's video watch history
    // For now, we'll just show a placeholder
    setStreak(0);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Flame className="h-4 w-4 text-orange-500" />
      <span>{streak} day streak</span>
    </div>
  );
}
