import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getCourses(userId: string) {
  return await prisma.course.findMany({
    where: { userId },
    include: {
      videos: {
        include: {
          progress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function CoursesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const courses = await getCourses(userId);

  return (
    <main className="container py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Courses</h1>
        </div>

        <Button asChild>
          <Link href="/courses/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">No courses yet</h2>
          <p className="mb-4 text-muted-foreground">
            Create your first course to get started
          </p>
          <Button asChild>
            <Link href="/courses/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Your First Course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
