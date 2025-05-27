"use client";

import React from "react";
import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import CourseCard from "@/components/CourseCard";

interface Course {
  id: string;
  title: string;
  deadline: Date | null;
  createdAt: Date;
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
  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress
        </p>
      </div>

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
        <Link
          href="/dashboard/courses/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center mb-8">
          <h2 className="mb-2 text-xl font-medium">No courses yet</h2>
          <p className="mb-4 text-muted-foreground">
            Add your first course to start learning
          </p>
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
