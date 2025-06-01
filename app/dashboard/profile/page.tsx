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
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
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

  useEffect(() => {
    if (profileData?.user.bio) {
      setBio(profileData.user.bio);
    }
  }, [profileData?.user.bio]);

  const updateProfileMutation = useMutation({
    mutationFn: async (newBio: string) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio: newBio }),
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
    onError: () => {
      // console.error("Error updating profile:", _error);
      toast.error("Failed to update profile");
    },
  });

  if (status === "loading" || isLoadingProfile) {
    return <LoadingScreen />;
  }

  if (profileQueryError) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-red-500 dark:text-red-400 text-lg">
                {profileQueryError instanceof Error
                  ? profileQueryError.message
                  : "An error occurred fetching profile"}
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
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

  if (!profileData || !session?.user) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-blue-500 text-lg">
                No profile data available or not signed in.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmitBio = () => {
    updateProfileMutation.mutate(bio);
  };

  return (
    <div className="min-h-screen">
      <main className="container py-3 md:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Details Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/70 dark:to-indigo-900/70 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-3 md:p-8 space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-8">
                {session.user.image ? (
                  <div className="relative h-20 w-20 md:h-32 md:w-32 overflow-hidden rounded-full ring-4 ring-blue-100 dark:ring-blue-800 shadow-md">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 80px, 128px"
                      quality={100}
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-md">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="space-y-1 md:space-y-2 text-center md:text-left">
                  <h2 className="text-xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {session.user.name || "User"}
                  </h2>
                  <p className="text-blue-700 dark:text-blue-300 text-sm md:text-lg">
                    {session.user.email}
                  </p>
                  <p className="text-blue-500 dark:text-blue-400 text-xs md:text-base">
                    Joined{" "}
                    {format(new Date(profileData.user.createdAt), "MMMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Bio Section - Below profile details */}
              <div className="space-y-3 pt-4 border-t border-blue-200 dark:border-blue-700">
                <div className="flex justify-between items-center">
                  <label className="text-base md:text-lg font-medium text-blue-800 dark:text-blue-200">
                    Bio
                  </label>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[80px] text-sm md:text-base rounded-xl border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-blue-950/50 transition-all duration-300"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800/50"
                        onClick={() => {
                          setIsEditing(false);
                          setBio(profileData.user.bio || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        onClick={handleSubmitBio}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-blue-700 dark:text-blue-300 text-sm md:text-base min-h-[40px] leading-relaxed">
                    {bio || "No bio yet. Click edit to add one!"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Section - Horizontal layout below profile */}
          <Card className="border border-blue-100 dark:border-blue-800 shadow bg-blue-50/50 dark:bg-blue-900/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                      Current Streak
                    </h3>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {profileData.stats.currentStreak} days
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                      Longest Streak
                    </h3>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {profileData.stats.longestStreak} days
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                      Courses Completed
                    </h3>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {profileData.stats.coursesCompleted}
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                      Total Watch Time
                    </h3>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {Math.round(profileData.stats.totalWatchTime / 60)} hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {profileData.completedCourses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Completed Courses
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileData.completedCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="border border-blue-100 dark:border-blue-800 shadow bg-blue-50/50 dark:bg-blue-900/30 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Completed</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
