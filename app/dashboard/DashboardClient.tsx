"use client";

import React from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Flame,
  Plus,
  Video,
  ArrowUpRight,
  TrendingUp,
  Target,
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

// Match the ActivityHeatmap component's interface
interface Activity {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  courses: SerializedCourse[];
  activities: Activity[];
}

export default function DashboardClient({
  courses,
  activities,
}: DashboardClientProps) {
  const coursesWithDeadlines = courses
    .filter((course) => course.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    )
    .slice(0, 6);

  // Get the most recently updated video with progress
  const recentlyWatchedVideos = courses
    .flatMap((course) =>
      course.videos
        .filter((video) => video.progress.length > 0)
        .map((video) => ({
          id: video.id,
          title: video.title,
          videoId: video.videoId,
          courseId: course.id,
          courseTitle: course.title,
          updatedAt: video.progress[0].updatedAt,
        }))
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  // Get the last 6 courses that have been recently watched
  const recentlyWatchedCourses = courses
    .map((course) => {
      // Find the most recent video progress for this course
      const mostRecentProgress = course.videos
        .flatMap((video) => video.progress)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

      return {
        course,
        lastActivity: mostRecentProgress
          ? new Date(mostRecentProgress.updatedAt)
          : new Date(0),
      };
    })
    .filter(({ lastActivity }) => lastActivity.getTime() > 0) // Only courses with some progress
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    .slice(0, 6)
    .map(({ course }) => course);

  // Calculate current streak
  let currentStreak = 0;
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedActivities.length > 0) {
    const mostRecentDate = new Date(sortedActivities[0].date);
    const today = new Date();
    const yesterday = new Date();
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

  // Calculate total completed videos
  const totalCompletedVideos = courses.reduce(
    (total, course) =>
      total +
      course.videos.filter((video) => video.progress.some((p) => p.completed))
        .length,
    0
  );

  // Calculate total videos
  const totalVideos = courses.reduce(
    (total, course) => total + course.videos.length,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus size={16} />
            <Link href="/dashboard/courses/create">Add Course</Link>
          </Button>
        </div>

        <div className="grid gap-8 grid-cols-1">
          {/* Activity Heatmap Section */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-2/3 flex justify-center lg:justify-start">
                <ActivityHeatmap activities={activities} cellSize={18} />
              </div>

              <div className="w-full lg:w-1/3 flex flex-col justify-center text-center lg:text-left">
                <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                  <div className="bg-blue-600/20 p-3 rounded-full">
                    <Flame className="h-8 w-8 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {currentStreak || 0} day streak
                  </h2>
                </div>
                <p className="text-gray-300 text-lg">
                  {currentStreak
                    ? `Keep up the great work! You're on fire! 🔥`
                    : "Start watching videos to build your streak!"}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines Section */}
          {coursesWithDeadlines.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-semibold flex items-center text-white">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  Upcoming Deadlines
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                          isUrgent
                            ? "border-red-500/50 bg-red-500/10 hover:bg-red-500/20"
                            : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70"
                        }`}
                      >
                        <div>
                          <h3 className="font-medium text-white truncate max-w-[200px]">
                            {course.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              isUrgent ? "text-red-400" : "text-gray-400"
                            }`}
                          >
                            {daysRemaining} days remaining
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-gray-400 hover:text-white"
                          asChild
                        >
                          <Link href={`/courses/${course.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recently Watched Videos Section */}
          {recentlyWatchedVideos.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-semibold flex items-center text-white">
                  <Video className="h-5 w-5 mr-2 text-blue-400" />
                  Recently Watched
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {recentlyWatchedVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/dashboard/courses/${video.courseId}?videoId=${video.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70 hover:border-zinc-600 transition-all duration-200 cursor-pointer">
                        <div className="overflow-hidden flex-1">
                          <h3 className="font-medium text-white truncate max-w-[200px]">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {video.courseTitle}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <ArrowUpRight className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Courses Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold flex items-center text-white">
                <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                Continue Learning
              </h2>
            </div>
            <div className="p-6">
              {recentlyWatchedCourses.length > 0 ? (
                <div>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {recentlyWatchedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                  {courses.length > 6 && (
                    <div className="mt-6 text-center">
                      <Button
                        className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700"
                        asChild
                      >
                        <Link href="/dashboard/mycourses">
                          View All Courses
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : courses.length > 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 mb-4">
                    Start watching videos to see your recently watched courses
                    here.
                  </p>
                  <Button
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <Link href="/dashboard/mycourses">View All Courses</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 mb-4">
                    You haven't added any courses yet.
                  </p>
                  <Button
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <Link href="/dashboard/courses/create">
                      Add Your First Course
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
