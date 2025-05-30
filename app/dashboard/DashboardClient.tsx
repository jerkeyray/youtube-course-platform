// filepath: /Users/srivastavya/code/yudoku/youtube-course-platform/app/dashboard/DashboardClient.tsx
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
    <main className="space-y-8 min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Track your progress and manage your courses
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus size={16} />
          <Link href="/dashboard/courses/new">Add Course</Link>
        </Button>
      </div>

      <div className="grid gap-8 grid-cols-1">
        {/* Updated Activity Section */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 lg:w-1/2 flex justify-center md:justify-start py-4 order-last md:order-first">
              <div className="w-full max-w-[380px] bg-white p-5 rounded-lg shadow-sm border border-blue-50">
                <ActivityHeatmap activities={activities} cellSize={11} />
              </div>
            </div>

            <div className="md:w-2/5 lg:w-1/2 md:pl-8 flex flex-col justify-center text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Flame className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-blue-600">
                  {currentStreak || 0} day streak
                </h2>
              </div>
              <p className="text-gray-700 text-lg mt-1">
                {currentStreak
                  ? `${currentStreak} days? Cool. Still not enough to explain anything without Googling. 😉`
                  : "Start watching videos to build your streak!"}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Section */}
        {coursesWithDeadlines.length > 0 && (
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50">
            <CardHeader className="pb-2 bg-blue-50">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" /> Upcoming
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-blue-50">
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
                      className={`flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-white shadow-sm ${
                        isUrgent
                          ? "border-amber-300 bg-amber-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div>
                        <h3 className="font-medium truncate max-w-[200px]">
                          {course.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            isUrgent
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {daysRemaining} days remaining
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
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
            </CardContent>
          </Card>
        )}

        {/* Courses Section */}
        <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-xl font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" /> Your Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-blue-50">
            {courses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-blue-600/70 mb-4">
                  You haven't added any courses yet.
                </p>
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700" asChild>
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
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50">
            <CardHeader className="pb-2 bg-blue-50">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-600" /> Recently
                Watched
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-blue-50">
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {recentlyWatchedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <div className="overflow-hidden">
                      <h3 className="font-medium truncate max-w-[200px]">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {video.courseTitle}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      asChild
                    >
                      <Link
                        href={`/courses/${video.courseId}/videos/${video.videoId}`}
                      >
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
