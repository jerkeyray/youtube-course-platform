"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Filter } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import LoadingScreen from "@/components/LoadingScreen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type FilterType = "all" | "in-progress" | "completed";

async function getCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  const data = await response.json();
  return data.courses;
}

export default function MyCoursesPage() {
  const [filter, setFilter] = useState<FilterType>("all");

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

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Apply filters
    switch (filter) {
      case "in-progress":
        filtered = filtered.filter(
          (course) =>
            course.completionPercentage > 0 && course.completionPercentage < 100
        );
        break;
      case "completed":
        filtered = filtered.filter(
          (course) => course.completionPercentage === 100
        );
        break;
      // "all" case doesn't need filtering
    }

    return filtered;
  }, [courses, filter]);

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
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
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
                    <div className="h-4 bg-zinc-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-zinc-700 rounded animate-pulse w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-2 bg-zinc-700 rounded animate-pulse w-4/5"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-3 bg-zinc-700 rounded animate-pulse w-16"></div>
                      <div className="h-6 bg-zinc-700 rounded animate-pulse w-20"></div>
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
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/dashboard/courses/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Course
              </Link>
            </Button>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-lg border bg-zinc-900 border-zinc-800 p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-white">
              No courses found
            </h2>
            <p className="mb-4 text-gray-400">
              {filter !== "all"
                ? "No courses match your current filter"
                : "Create your first course to get started"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/dashboard/courses/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Course
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
