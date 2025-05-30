"use client";

import React from "react";
import {
  format,
  subDays,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SerializedActivity {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActivityHeatmapProps {
  activities: SerializedActivity[];
  cellSize?: number; // Add cellSize prop with a default value
}

export default function ActivityHeatmap({
  activities,
  cellSize = 7, // Default cellSize to 7
}: ActivityHeatmapProps) {
  const today = startOfDay(new Date());
  const days = 357; // ~51 weeks
  const weeks = Math.ceil(days / 7);

  // Map date string to activity status
  const activityMap = new Map<string, boolean>();
  activities.forEach((a) => {
    if (a.completed) activityMap.set(a.date, true);
  });

  // Build grid: columns = weeks, rows = days
  const grid: { date: Date; active: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; active: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      if (dayOffset >= days) break;
      const date = subDays(today, days - 1 - dayOffset);
      const dateStr = format(date, "yyyy-MM-dd");
      week.push({
        date,
        active: activityMap.get(dateStr) || false,
      });
    }
    grid.push(week);
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-[2px] overflow-hidden">
        {grid.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-[2px]">
            {week.map((cell, dIdx) => {
              const daysSinceToday = differenceInCalendarDays(today, cell.date);
              const isToday = daysSinceToday === 0;

              return (
                <TooltipProvider key={dIdx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-[${cellSize}px] h-[${cellSize}px] rounded-sm ${
                          cell.active
                            ? "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-800"
                        } ${isToday ? "ring-1 ring-blue-500" : ""}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs p-2">
                      <p className="font-medium">
                        {format(cell.date, "EEEE, MMMM d, yyyy")}
                      </p>
                      <p>
                        {cell.active ? "Activity completed" : "No activity"}
                      </p>
                      {isToday && (
                        <p className="font-semibold text-primary mt-1">Today</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
