"use client";

import React from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import CourseCard from "@/components/CourseCard";
import StreakDisplay from "@/components/StreakDisplay";

interface Course {
  id: string;
  title: string;
  playlistId: string;
  deadline: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  videos: any[];
  completionPercentage?: number;
}

interface Activity {
  date: string;
  completed: boolean;
}

interface DashboardClientProps {
  courses: Course[];
  activities: Activity[];
}

export default function DashboardClient({
  courses,
  activities,
}: DashboardClientProps) {
  // Filter courses with deadlines and calculate days remaining
  const coursesWithDeadlines = courses
    .filter((course) => course.deadline)
    .map((course) => ({
      ...course,
      daysRemaining: Math.ceil(
        (new Date(course.deadline!).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <main className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your learning progress
            </p>
          </div>
          <StreakDisplay />
        </div>
      </div>

      {coursesWithDeadlines.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Deadlines</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesWithDeadlines.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border bg-card p-4 flex flex-col"
              >
                <h3 className="font-medium mb-2">{course.title}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Days remaining:</span>
                  <span
                    className={`font-medium ${
                      course.daysRemaining <= 7
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {course.daysRemaining} days
                  </span>
                </div>
                {course.completionPercentage !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{course.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${course.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <ActivityHeatmap activities={activities} />
        </div>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center pb-4">
        <div>
          <h2 className="text-2xl font-bold">Your Courses</h2>
          <p className="text-muted-foreground mt-1">
            Continue learning from where you left off
          </p>
        </div>
        {courses.length > 0 && (
          <Link
            href="/dashboard/courses/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add New Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center mb-8">
          <h2 className="mb-2 text-xl font-medium">No courses yet</h2>
          <p className="mb-4 text-muted-foreground">
            Add your first course to start learning
          </p>
          <Link
            href="/dashboard/courses/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Add New Course
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
