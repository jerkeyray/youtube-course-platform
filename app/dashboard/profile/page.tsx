"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  BookOpen,
  Clock,
  Edit2,
  CheckCircle,
  Flame,
} from "lucide-react";

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  totalWatchTime: number;
}

interface CompletedCourseType {
  id: string;
  title: string;
}

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    createdAt: string;
  };
  stats: UserStats;
  completedCourses: CompletedCourseType[];
}

async function fetchProfileData(): Promise<ProfileData> {
  const response = await fetch("/api/profile");
  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }
  return response.json();
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileQueryError,
  } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: fetchProfileData,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  if (status === "loading" || isLoadingProfile) {
    return <LoadingScreen />;
  }

  if (profileQueryError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <p className="text-red-400 text-lg">
                  {profileQueryError instanceof Error
                    ? profileQueryError.message
                    : "An error occurred fetching profile"}
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["profile"] })
                  }
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData || !session?.user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <p className="text-blue-400 text-lg">
                  No profile data available or not signed in.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header - Twitter-style */}
          <div className="relative">
            {/* Cover Image Placeholder */}
            <div className="h-48 bg-gradient-to-r from-zinc-900 via-zinc-800 to-black rounded-t-2xl"></div>

            {/* Profile Image - Overlapping */}
            <div className="absolute -bottom-16 left-6">
              {session.user.image ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-black shadow-xl">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    fill
                    className="object-cover"
                    sizes="128px"
                    quality={100}
                    priority
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-black">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="mt-20 px-6">
            {/* Name and Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {session.user.name || "User"}
                </h1>
                <p className="text-gray-400 text-sm">{session.user.email}</p>
                <p className="text-gray-500 text-sm">
                  Joined{" "}
                  {format(new Date(profileData.user.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>

            {/* Stats Section - Twitter-style */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm font-medium text-gray-400">
                      Current Streak
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {profileData.stats.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500">days</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-sm font-medium text-gray-400">
                      Longest Streak
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {profileData.stats.longestStreak}
                  </p>
                  <p className="text-xs text-gray-500">days</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-400">
                      Completed
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {profileData.stats.coursesCompleted}
                  </p>
                  <p className="text-xs text-gray-500">courses</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-400">
                      Watch Time
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(profileData.stats.totalWatchTime / 60)}
                  </p>
                  <p className="text-xs text-gray-500">hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Courses Section */}
          {profileData.completedCourses.length > 0 && (
            <div className="mt-8 px-6">
              <h2 className="text-xl font-bold mb-4 text-white">
                Completed Courses
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileData.completedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-all duration-200"
                  >
                    <h3 className="font-semibold mb-2 text-white">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
