"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  BookOpen,
  Clock,
  Edit2,
  CheckCircle,
  Flame,
  Star,
  Target,
} from "lucide-react";

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  totalWatchTime: number;
}

interface CompletedCourse {
  id: string;
  title: string;
  completedAt: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
}

interface ProfileData {
  user: UserData;
  stats: UserStats;
  completedCourses: CompletedCourse[];
}

interface ProfileResponse {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    createdAt: string;
    completedCourses: CompletedCourse[];
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  activity: {
    totalWatchTime: number;
  };
}

async function fetchProfileData(): Promise<ProfileResponse> {
  const userResponse = await fetch("/api/profile");
  if (!userResponse.ok) {
    throw new Error(`Failed to fetch user data: ${userResponse.status}`);
  }
  const userData = await userResponse.json();

  const streakResponse = await fetch("/api/user/streak");
  if (!streakResponse.ok) {
    throw new Error(`Failed to fetch streak data: ${streakResponse.status}`);
  }
  const streakData = await streakResponse.json();

  const activityResponse = await fetch("/api/activity");
  if (!activityResponse.ok) {
    throw new Error(
      `Failed to fetch activity data: ${activityResponse.status}`
    );
  }
  const activityData = await activityResponse.json();

  return {
    user: userData,
    streak: streakData,
    activity: activityData,
  };
}

export default function ProfilePage() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const queryClient = useQueryClient();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: fetchProfileData,
    enabled: !!userId && !!clerkUser,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Set initial bio when profile data is loaded
  useEffect(() => {
    if (profileData?.user.bio) {
      setBio(profileData.user.bio);
    }
  }, [profileData?.user.bio]);

  const updateProfileMutation = useMutation({
    mutationFn: async (bio: string) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    },
  });

  if (!isAuthLoaded || !isClerkLoaded) {
    return <Loader size="lg" />;
  }

  if (isLoadingProfile) {
    return <Loader size="lg" />;
  }

  if (error) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-destructive text-lg">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
              <Button
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
    );
  }

  if (!profileData || !clerkUser) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">
                No profile data available
              </p>
              <Button
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["profile"] })
                }
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-8">
                  {clerkUser.imageUrl ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-white shadow-xl">
                      <Image
                        src={clerkUser.imageUrl}
                        alt={clerkUser.fullName || "Profile"}
                        fill
                        className="object-cover"
                        sizes="128px"
                        quality={100}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {clerkUser.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {clerkUser.fullName || "User"}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {clerkUser.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-gray-500">
                      Joined{" "}
                      {format(
                        new Date(profileData.user.createdAt),
                        "MMMM yyyy"
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-medium text-gray-900">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[120px] text-lg rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
                    />
                  ) : (
                    <p className="text-gray-600 text-lg">
                      {bio || "No bio yet. Click edit to add one!"}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => updateProfileMutation.mutate(bio)}
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 py-6 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                      >
                        {updateProfileMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader size="sm" className="text-white" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="py-6 text-lg rounded-xl"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full py-6 text-lg rounded-xl gap-2 hover:shadow-lg transition-all duration-300"
                    >
                      <Edit2 className="h-5 w-5" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Learning Stats
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Flame className="h-5 w-5 text-orange-500" />,
                      label: "Current Streak",
                      value: `${profileData.streak.currentStreak} days`,
                    },
                    {
                      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
                      label: "Longest Streak",
                      value: `${profileData.streak.longestStreak} days`,
                    },
                    {
                      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                      label: "Courses Completed",
                      value:
                        profileData.user.completedCourses?.length.toString() ||
                        "0",
                    },
                    {
                      icon: <Clock className="h-5 w-5 text-blue-500" />,
                      label: "Watch Time",
                      value: `${profileData.activity.totalWatchTime}h`,
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {stat.icon}
                        <span className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Courses */}
          <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Completed Courses
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {profileData.user.completedCourses?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-600 text-lg">
                    No completed courses yet. Start your learning journey today!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {profileData.user.completedCourses?.map((course) => (
                    <Card
                      key={course.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <BookOpen className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-gray-600">
                              Completed{" "}
                              {format(
                                new Date(course.completedAt),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
