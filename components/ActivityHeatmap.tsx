"use client";

import React from "react";
import {
  format,
  subDays,
  startOfDay,
  differenceInCalendarDays,
  getDay,
  addDays,
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
  cellSize?: number;
}

export default function ActivityHeatmap({
  activities,
  cellSize = 12,
}: ActivityHeatmapProps) {
  const today = startOfDay(new Date());
  
  // Calculate start date (Sunday 20 weeks ago)
  const todayDay = getDay(today); // 0 = Sunday, 1 = Monday, ...
  const daysToSubtract = (20 * 7) + todayDay; 
  const startDate = subDays(today, daysToSubtract);

  // Map date string to activity status
  const activityMap = new Map<string, boolean>();
  activities.forEach((a) => {
    if (a.completed) activityMap.set(a.date, true);
  });

  // Build grid: columns = weeks, rows = days (0=Sun, 6=Sat)
  const weeks = 21; 
  const grid: { date: Date; active: boolean }[][] = [];
  
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; active: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
        // Row 0 is Sunday
        const date = addDays(startDate, (w * 7) + d + 1); // +1 to adjust start? 
        // Wait, if startDate is subDays(today, daysToSubtract) where daysToSubtract involves todayDay...
        // Let's verify:
        // If today is Wed (3). daysToSubtract = 20*7 + 3 = 143.
        // startDate = Today - 143 days.
        // 143 days ago: 140 days (20 weeks) ago was Wed. -3 days = Sun.
        // So startDate is Sunday.
        // Then w=0, d=0 => startDate. Correct.
        // Actually standard Github graph starts with Sunday as row 0.
        
        const cellDate = addDays(startDate, (w * 7) + d);
        const dateStr = format(cellDate, "yyyy-MM-dd");
        
        week.push({
            date: cellDate,
            active: activityMap.get(dateStr) || false
        });
    }
    grid.push(week);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit flex gap-1">
        {grid.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((cell, dIdx) => {
              const daysDifference = differenceInCalendarDays(today, cell.date);
              const isToday = daysDifference === 0;
              const isFuture = daysDifference < 0;

              if (isFuture) return null; // Shouldn't happen with correct calculation logic but safety

              return (
                <TooltipProvider key={dIdx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                        className={`rounded-sm transition-all duration-200 ${
                          cell.active
                            ? "bg-white"
                            : "bg-white/5 hover:bg-white/10"
                        } ${isToday ? "ring-1 ring-white" : ""}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-xs p-2 bg-[#0A0A0A] border border-white/10 text-neutral-300"
                    >
                      <p className="font-medium text-white mb-1">
                        {format(cell.date, "MMM d, yyyy")}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-500">
                        {cell.active ? "Completed" : "No Activity"}
                      </p>
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
