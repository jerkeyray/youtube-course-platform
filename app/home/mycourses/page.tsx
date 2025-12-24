"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import CourseCard, { SerializedCourse } from "@/components/CourseCard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

async function getCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  const data = await response.json();
  return data.courses;
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
    toast.error("Failed to load courses");
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container py-8 px-4 lg:px-6">
          <div className="rounded-lg border bg-zinc-900 border-zinc-800 p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-white">
              Error loading courses
            </h2>
            <p className="mb-4 text-gray-400">Please try refreshing the page</p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container py-8 px-4 lg:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">My Courses</h1>
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#0D1016] rounded-xl border border-white/10 p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-8 w-8 rounded-md bg-zinc-800" />
                </div>

                <Skeleton className="h-4 w-20 bg-zinc-800" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 bg-zinc-800" />
                    <Skeleton className="h-3 w-10 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-1.5 w-full bg-zinc-800 rounded-full" />
                </div>

                <Skeleton className="h-10 w-full bg-zinc-800 rounded-md" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container py-8 px-4 lg:px-6">
        {sortedCourses.length > 0 && (
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">My Courses</h1>
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
          <div className="flex min-h-[80vh] flex-col items-center justify-center">
            <div className="w-full max-w-[360px] space-y-10 -translate-y-[10vh]">
              <div className="space-y-4">
                <h2 className="text-[28px] font-medium leading-tight tracking-tight text-white text-center">
                  Start with one course.
                </h2>
                <p className="text-[15px] leading-7 text-zinc-500 text-left">
                  Yudoku works best when you focus on a single commitment.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-8">
                <Button
                  className="bg-white text-black hover:bg-neutral-200 px-10 h-10 font-medium w-auto"
                  asChild
                >
                  <Link href="/home/courses/create">Add a playlist</Link>
                </Button>

                <p className="text-xs text-center text-zinc-500/60 font-medium">
                  You can add more later. You probably won’t need to.
                </p>
              </div>
            </div>
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
      </main>
    </div>
  );
}
