"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  completedCourses: any[];
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
    error,
  } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: fetchProfileData,
    enabled: !!session?.user?.id,
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

  if (status === "loading" || isLoadingProfile) {
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

  if (!profileData || !session?.user) {
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
      <main className="container py-3 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-3 md:gap-8 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-3 md:p-8 space-y-4 md:space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-8">
                  {session.user.image ? (
                    <div className="relative h-20 w-20 md:h-32 md:w-32 overflow-hidden rounded-full ring-4 ring-white shadow-xl">
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
                    <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-xl">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="space-y-1 md:space-y-2 text-center md:text-left">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                      {session.user.name || "User"}
                    </h2>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {session.user.email}
                    </p>
                    <p className="text-gray-500 text-xs md:text-base">
                      Joined{" "}
                      {format(
                        new Date(profileData.user.createdAt),
                        "MMMM yyyy"
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="text-sm md:text-lg font-medium text-gray-900">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px] md:min-h-[120px] text-sm md:text-lg rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm md:text-lg">
                      {bio || "No bio yet. Click edit to add one!"}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => updateProfileMutation.mutate(bio)}
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 py-2 md:py-6 text-sm md:text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
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
                        className="py-2 md:py-6 text-sm md:text-lg rounded-xl"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full py-2 md:py-6 text-sm md:text-lg rounded-xl gap-2 hover:shadow-lg transition-all duration-300"
                    >
                      <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-3 md:p-8 space-y-4 md:space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Current Streak</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {profileData.stats.currentStreak} days
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Longest Streak</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {profileData.stats.longestStreak} days
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Courses Completed</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {profileData.stats.coursesCompleted}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Total Watch Time</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(profileData.stats.totalWatchTime / 60)} hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Courses Section */}
          {profileData.completedCourses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Completed Courses</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileData.completedCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
