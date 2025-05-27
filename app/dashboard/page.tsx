import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import DashboardClient from "./DashboardClient";

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

async function getCourses(userId: string): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      videos: {
        include: {
          progress: true,
        },
      },
    },
  });
  return courses;
}

async function getActivities(userId: string): Promise<Activity[]> {
  const activities = await (
    prisma as PrismaClient & { userActivity: any }
  ).userActivity.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 365,
  });
  return activities;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [courses, activities] = await Promise.all([
    getCourses(userId),
    getActivities(userId),
  ]);

  return <DashboardClient courses={courses} activities={activities} />;
}
