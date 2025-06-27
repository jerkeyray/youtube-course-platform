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
  cellSize = 10, // Increased default cell size for bigger heatmap
}: ActivityHeatmapProps) {
  const today = startOfDay(new Date());
  const days = 120; // Adjusted number of days to work better with larger cells
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

  // Use square cells for better visual balance
  const squareSize = cellSize; // Keep the same size for width and height to make it square

  return (
    <div className="w-full overflow-visible px-2">
      {/* Simplified heatmap without labels */}
      <div className="w-full flex justify-center">
        {/* Grid */}
        <div className="flex gap-1.5 overflow-visible">
          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((cell, dIdx) => {
                const daysSinceToday = differenceInCalendarDays(
                  today,
                  cell.date
                );
                const isToday = daysSinceToday === 0;

                return (
                  <TooltipProvider key={dIdx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          style={{
                            width: `${squareSize}px`,
                            height: `${squareSize}px`,
                          }}
                          className={`rounded-sm transition-all duration-200 ${
                            cell.active
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-zinc-800 hover:bg-zinc-700"
                          } ${isToday ? "ring-2 ring-blue-400" : ""}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="text-xs p-3 bg-zinc-900 border border-zinc-700 shadow-xl"
                      >
                        <p className="font-medium text-white">
                          {format(cell.date, "EEEE, MMMM d, yyyy")}
                        </p>
                        <div className="flex items-center mt-2">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              cell.active ? "bg-blue-400" : "bg-zinc-600"
                            }`}
                          ></div>
                          <p className="text-gray-300">
                            {cell.active ? "Activity completed" : "No activity"}
                          </p>
                        </div>
                        {isToday && (
                          <p className="font-semibold text-blue-400 mt-2 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></span>
                            Today
                          </p>
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
    </div>
  );
}
