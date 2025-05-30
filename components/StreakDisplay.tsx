"use client";

import { useSession } from "next-auth/react";
import { Flame, Award, Star, Calendar, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, subDays } from "date-fns";

interface StreakDisplayProps {
  activities: Array<{
    id: string;
    userId: string;
    date: string;
    completed: boolean;
  }>;
}

export function StreakDisplay({ activities }: StreakDisplayProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalActiveDays = 0;

  // Create a map of dates with activity
  const activityDates = new Map<string, boolean>();
  activities.forEach((activity) => {
    if (activity.completed) {
      activityDates.set(activity.date, true);
    }
  });

  // Count total active days
  totalActiveDays = activityDates.size;

  // Calculate streaks
  // First, create an array of dates with activity
  const sortedDates = Array.from(activityDates.keys())
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length > 0) {
    // Initialize temp streak
    tempStreak = 1;

    // Check if the most recent activity was today or yesterday to count current streak
    const mostRecent = sortedDates[sortedDates.length - 1];
    const isActive =
      format(mostRecent, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ||
      format(mostRecent, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd");

    // Calculate streaks by checking consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];

      // Check if dates are consecutive
      const expectedNextDate = new Date(prevDate);
      expectedNextDate.setDate(expectedNextDate.getDate() + 1);

      if (
        format(currDate, "yyyy-MM-dd") ===
        format(expectedNextDate, "yyyy-MM-dd")
      ) {
        tempStreak++;
      } else {
        // Streak broken, check if it was longest
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    // Check final streak
    longestStreak = Math.max(longestStreak, tempStreak);

    // Set current streak if active
    if (isActive) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Calculate completion rate (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, i);
    return format(date, "yyyy-MM-dd");
  });

  const activeDaysLast30 = last30Days.filter((date) =>
    activityDates.has(date)
  ).length;
  const completionRate = Math.round((activeDaysLast30 / 30) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Your performance</h3>
        <div className="text-xs text-muted-foreground">
          {format(today, "MMMM yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/20 mr-3">
                <Flame className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Current Streak
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{currentStreak}</p>
                  <p className="text-sm ml-1 text-blue-600/70 dark:text-blue-400/70">
                    days
                  </p>
                </div>
              </div>
            </div>
            {currentStreak > 0 && (
              <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 flex items-center">
                <Zap className="h-3 w-3 mr-1" /> Keep it going!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/20 mr-3">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Longest Streak
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{longestStreak}</p>
                  <p className="text-sm ml-1 text-blue-600/70 dark:text-blue-400/70">
                    days
                  </p>
                </div>
              </div>
            </div>
            {currentStreak > 0 && currentStreak === longestStreak && (
              <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 flex items-center">
                <Star className="h-3 w-3 mr-1" /> Personal best!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/20 mr-3">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Completion Rate
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{completionRate}%</p>
                  <p className="text-sm ml-1 text-blue-600/70 dark:text-blue-400/70">
                    last 30 days
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-blue-200 dark:bg-blue-800">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-3 text-center text-xs text-blue-600/70 dark:text-blue-400/70">
        <p>
          Total active days:{" "}
          <span className="font-medium">{totalActiveDays}</span>
        </p>
      </div>
    </div>
  );
}
