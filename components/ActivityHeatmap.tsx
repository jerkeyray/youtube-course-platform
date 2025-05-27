"use client";

import React from "react";
import { format, subDays, startOfDay } from "date-fns";

interface ActivityData {
  date: string; // yyyy-MM-dd
  completed: boolean;
}

interface ActivityHeatmapProps {
  activities: ActivityData[];
}

const ACTIVE_COLOR = "bg-green-500";
const INACTIVE_COLOR = "bg-gray-200 dark:bg-gray-800";

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const today = startOfDay(new Date());
  const days = 365;
  const weeks = Math.ceil(days / 7);

  // Map date string to boolean (any activity = true)
  const activityMap = new Map<string, boolean>();
  activities.forEach((a) => {
    if (a.completed) activityMap.set(a.date, true);
  });

  // Build grid: columns = weeks, rows = days (Mon-Sun)
  const grid: { date: Date; active: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: { date: Date; active: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      if (dayOffset >= days) break;
      const date = subDays(today, days - 1 - dayOffset);
      const dateStr = format(date, "yyyy-MM-dd");
      week.push({ date, active: activityMap.get(dateStr) || false });
    }
    grid.push(week);
  }

  return (
    <div className="flex gap-1">
      {grid.map((week, wIdx) => (
        <div key={wIdx} className="flex flex-col gap-1">
          {week.map((cell, dIdx) => (
            <div
              key={dIdx}
              className={`w-3 h-3 rounded-sm border border-black/5 dark:border-white/5 ${
                cell.active ? ACTIVE_COLOR : INACTIVE_COLOR
              }`}
              title={`${cell.active ? "Activity" : "No activity"} on ${format(
                cell.date,
                "MMM d, yyyy"
              )}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
