"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import {
  Trophy,
  BookOpen,
  Clock,
  Edit2,
  CheckCircle,
  Flame,
  Loader2,
  Zap,
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

export default function ProfilePage() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthLoaded || !isClerkLoaded) return;

      try {
        setIsLoadingProfile(true);
        setError(null);
        console.log("Fetching profile data...");

        // Fetch user data from Supabase
        const userResponse = await fetch("/api/profile");
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

        // Fetch streak data
        const streakResponse = await fetch("/api/user/streak");
        if (!streakResponse.ok) {
          throw new Error(
            `Failed to fetch streak data: ${streakResponse.status}`
          );
        }
        const streakData = await streakResponse.json();

        // Fetch activity data
        const activityResponse = await fetch("/api/activity");
        if (!activityResponse.ok) {
          throw new Error(
            `Failed to fetch activity data: ${activityResponse.status}`
          );
        }
        const activityData = await activityResponse.json();

        // Combine all data
        const combinedData: ProfileData = {
          user: {
            id: clerkUser?.id || "",
            name: clerkUser?.fullName || null,
            email: clerkUser?.primaryEmailAddress?.emailAddress || null,
            image: clerkUser?.imageUrl || null,
            createdAt: userData.createdAt,
          },
          stats: {
            currentStreak: streakData.currentStreak || 0,
            longestStreak: streakData.longestStreak || 0,
            coursesCompleted: userData.completedCourses?.length || 0,
            totalWatchTime: activityData.totalWatchTime || 0,
          },
          completedCourses: userData.completedCourses || [],
        };

        console.log("Profile data received:", combinedData);
        setProfileData(combinedData);
        setBio(userData.bio || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again later.");
        toast.error("Failed to load profile data");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (userId && clerkUser) {
      console.log("User data available, fetching profile...");
      fetchProfileData();
    } else if (isAuthLoaded && isClerkLoaded) {
      console.log("No user data available after auth loaded");
      setIsLoadingProfile(false);
    }
  }, [userId, clerkUser, isAuthLoaded, isClerkLoaded]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
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

      const updatedData = await response.json();
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                bio: updatedData.bio,
              },
            }
          : null
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthLoaded || !isClerkLoaded) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading authentication...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoadingProfile) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading profile data...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return (
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No profile data available
              </p>
              <Button onClick={() => window.location.reload()}>
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
          {/* Profile Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Profile
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Manage your profile and view your learning stats
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2 rounded-full px-6 py-6 text-lg hover:shadow-lg transition-all duration-300"
              >
                <Edit2 className="h-5 w-5" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center gap-6">
                  {profileData.user.image ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-white shadow-xl">
                      <Image
                        src={profileData.user.image}
                        alt={profileData.user.name || "Profile"}
                        fill
                        className="object-cover"
                        sizes="128px"
                        quality={100}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {profileData.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {profileData.user.name || "User"}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {profileData.user.email}
                    </p>
                    <p className="text-gray-500 mt-2">
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

                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
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
                      value: `${profileData.stats.currentStreak} days`,
                    },
                    {
                      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
                      label: "Longest Streak",
                      value: `${profileData.stats.longestStreak} days`,
                    },
                    {
                      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                      label: "Courses Completed",
                      value: profileData.stats.coursesCompleted.toString(),
                    },
                    {
                      icon: <Clock className="h-5 w-5 text-blue-500" />,
                      label: "Watch Time",
                      value: `${profileData.stats.totalWatchTime}h`,
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
              {profileData.completedCourses.length === 0 ? (
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
                  {profileData.completedCourses.map((course) => (
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
