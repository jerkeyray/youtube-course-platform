"use client";

import React from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import CourseCard from "@/components/CourseCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Plus,
  Video,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { format } from "date-fns";

interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  videos: Array<{
    id: string;
    title: string;
    videoId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    progress: Array<{
      id: string;
      userId: string;
      videoId: string;
      completed: boolean;
      updatedAt: string;
    }>;
  }>;
}

interface SerializedActivity {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  courses: SerializedCourse[];
  activities: SerializedActivity[];
}

export default function DashboardClient({
  courses,
  activities,
}: DashboardClientProps) {
  // Filter courses with deadlines and calculate days remaining
  const coursesWithDeadlines = courses
    .filter((course) => course.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    );

  // // Calculate total videos and completed videos
  // const totalVideos = courses.reduce(
  //   (acc, course) => acc + course.videos.length,
  //   0
  // );
  // const completedVideos = courses.reduce((acc, course) => {
  //   const completed = course.videos.filter(
  //     (video) => video.progress?.[0]?.completed
  //   ).length;
  //   return acc + completed;
  // }, 0);

  // Get the most recently updated video with progress
  const today = new Date();
  const recentlyWatchedVideos = courses
    .flatMap((course) =>
      course.videos.map((video) => ({
        courseId: course.id,
        courseTitle: course.title,
        ...video,
      }))
    )
    .filter((video) => video.progress?.[0]?.updatedAt)
    .sort(
      (a, b) =>
        new Date(b.progress[0].updatedAt).getTime() -
        new Date(a.progress[0].updatedAt).getTime()
    )
    .slice(0, 3);

  // Calculate current streak for the activity banner
  const sortedActivities = [...activities]
    .filter((a) => a.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  if (sortedActivities.length > 0) {
    const mostRecentDate = new Date(sortedActivities[0].date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if most recent activity was today or yesterday to continue streak
    if (
      format(mostRecentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ||
      format(mostRecentDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
    ) {
      currentStreak = 1;
      const activityDates = new Set();
      sortedActivities.forEach((a) =>
        activityDates.add(format(new Date(a.date), "yyyy-MM-dd"))
      );

      // Count consecutive days backward from most recent activity
      const checkDate = new Date(mostRecentDate);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = format(checkDate, "yyyy-MM-dd");
        if (activityDates.has(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return (
    <main className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and manage your courses
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          <Link href="/dashboard/courses/new">Add Course</Link>
        </Button>
      </div>

      <div className="grid gap-8 grid-cols-1">
        {/* Updated Activity Section */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-orange-500">
                  {currentStreak || 0} day streak
                </h2>
              </div>
              <p className="text-gray-600">
                {currentStreak
                  ? `${currentStreak} days? Keep it up! You're on fire! 🔥`
                  : "Start watching videos to build your streak!"}
              </p>
            </div>
            <div className="hidden md:block">
              <StreakDisplay activities={activities} />
            </div>
          </div>

          <div className="mt-8">
            <ActivityHeatmap activities={activities} cellSize={10} />
          </div>
        </div>

        {/* Upcoming Deadlines Section */}
        {coursesWithDeadlines.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-600" /> Upcoming
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {coursesWithDeadlines.map((course) => {
                  const deadlineDate = new Date(course.deadline!);
                  const daysRemaining = Math.ceil(
                    (deadlineDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysRemaining <= 3;

                  return (
                    <div
                      key={course.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isUrgent
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-card"
                      } hover:bg-accent/50 transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-10 w-10 rounded-full ${
                            isUrgent
                              ? "bg-red-100 dark:bg-red-900/50"
                              : "bg-amber-100 dark:bg-amber-900/50"
                          } flex items-center justify-center`}
                        >
                          <Clock
                            className={`h-5 w-5 ${
                              isUrgent
                                ? "text-red-600 dark:text-red-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p
                            className={`text-sm ${
                              isUrgent
                                ? "text-red-600 dark:text-red-400 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            Due {format(deadlineDate, "MMM d, yyyy")} (
                            {daysRemaining}{" "}
                            {daysRemaining === 1 ? "day" : "days"} left)
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" /> Your Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-muted-foreground mb-4">
                  You haven't added any courses yet.
                </p>
                <Button className="mt-2" asChild>
                  <Link href="/dashboard/courses/new">
                    Add Your First Course
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Watched Videos Section */}
        {recentlyWatchedVideos.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Video className="h-5 w-5 mr-2 text-purple-600" /> Recently
                Watched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {recentlyWatchedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-medium truncate max-w-[200px]">
                          {video.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {video.courseTitle}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1" asChild>
                      <Link href={`/dashboard/courses/${video.courseId}`}>
                        <span className="hidden sm:inline">View</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
