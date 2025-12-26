"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CourseCard, { SerializedCourse } from "@/components/CourseCard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";

async function getCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  const data = await response.json();
  return data.courses as SerializedCourse[];
}

export default function MyCoursesPage() {
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) toast.error("Failed to load courses");
  }, [error]);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      // Primary sort: Completion status (Incomplete first)
      const aCompleted = a.completionPercentage === 100;
      const bCompleted = b.completionPercentage === 100;

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Secondary sort: Recently updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [courses]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-5xl">
            <div className="rounded-lg border border-border bg-card/40 p-8 text-center">
              <h2 className="mb-2 text-xl font-medium text-white">
                Error loading courses
              </h2>
              <p className="mb-4 text-gray-400">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-5xl">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-medium text-zinc-400">
                  My Courses
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-white text-black hover:bg-neutral-200"
                  asChild
                >
                  <Link href="/home/courses/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Course
                  </Link>
                </Button>
              </div>
            </div>

            <LoadingScreen variant="contained" text="Loading courses" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-5xl">
          {sortedCourses.length > 0 && (
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-medium text-zinc-400">
                  My Courses
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="bg-white text-black hover:bg-neutral-200"
                  asChild
                >
                  <Link href="/home/courses/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Course
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {sortedCourses.length === 0 ? (
            <div className="w-full text-center py-12 border border-dashed border-border rounded-lg bg-card/40">
              <h2 className="text-lg font-medium text-white mb-2">
                No active courses
              </h2>
              <p className="text-sm text-neutral-500 mb-4">
                Start a new learning journey today.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-border hover:bg-accent hover:text-foreground"
              >
                <Link href="/home/courses/create">Create Course</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedCourses.map((course: SerializedCourse, index: number) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isPrimary={
                    index === 0 && (course.completionPercentage ?? 0) < 100
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
