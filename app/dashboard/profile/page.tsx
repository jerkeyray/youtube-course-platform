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
  User,
  Calendar,
  Mail,
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
  completedAt: string;
  totalHours: number;
  totalVideos: number;
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
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Profile Header Skeleton */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-zinc-700 animate-pulse"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-8 w-48 bg-zinc-700 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-zinc-700 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center">
                    <div className="h-6 w-6 bg-zinc-700 rounded mx-auto mb-3 animate-pulse"></div>
                    <div className="h-8 w-12 bg-zinc-700 rounded mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 w-16 bg-zinc-700 rounded mx-auto animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completed Courses Skeleton */}
            <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="h-16 w-16 bg-zinc-700 rounded-full mx-auto mb-4 animate-pulse"></div>
                  <div className="h-8 w-48 bg-zinc-700 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-32 bg-zinc-700 rounded mx-auto animate-pulse"></div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-zinc-800/50 rounded-xl animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
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
      <main className="container py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {session.user.image ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-zinc-700">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        fill
                        className="object-cover"
                        sizes="80px"
                        quality={85}
                        priority
                        loading="eager"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-zinc-700">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {session.user.name || "User"}
                  </h1>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{session.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined{" "}
                        {format(
                          new Date(profileData.user.createdAt),
                          "MMMM yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {profileData.stats.currentStreak}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Current Streak
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {profileData.stats.longestStreak}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Longest Streak
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {profileData.stats.coursesCompleted}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Completed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(profileData.stats.totalWatchTime / 60)}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Hours Watched
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Courses */}
          {profileData.completedCourses.length > 0 && (
            <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Your Achievements
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {profileData.completedCourses.length} course
                    {profileData.completedCourses.length !== 1 ? "s" : ""}{" "}
                    completed
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.completedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border border-zinc-600/50 hover:border-zinc-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 leading-tight">
                          {course.title}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>{course.totalHours} hours</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.totalVideos} videos</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Completed{" "}
                              {format(
                                new Date(course.completedAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State for No Completed Courses */}
          {profileData.completedCourses.length === 0 && (
            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No completed courses yet
                </h3>
                <p className="text-gray-400 text-sm">
                  Start learning and complete your first course to see it here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
