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
                <Link href="/dashboard/courses/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="bg-zinc-900 border-zinc-800 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-2 w-4/5" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

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

        {sortedCourses.length === 0 ? (
          <div className="rounded-lg border bg-zinc-900 border-zinc-800 p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-white">
              No courses found
            </h2>
            <p className="mb-4 text-gray-400">
              Create your first course to get started
            </p>
            <Button
              className="bg-white text-black hover:bg-neutral-200"
              asChild
            >
              <Link href="/home/courses/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Course
              </Link>
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
      </main>
    </div>
  );
}
