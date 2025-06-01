"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <main className="container py-8">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">Error loading courses</h2>
          <p className="mb-4 text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container py-8">
        <LoadingScreen variant="fullscreen" />
      </main>
    );
  }

  return (
    <main className="container py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filter === "all"
                  ? "All Courses"
                  : filter === "in-progress"
                  ? "In Progress"
                  : "Completed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Courses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("in-progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/dashboard/courses/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Course
            </Link>
          </Button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">No courses found</h2>
          <p className="mb-4 text-muted-foreground">
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
  );
}
