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
    <main className="container py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your profile and view your learning stats
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                {profileData.user.image ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-full">
                    <Image
                      src={profileData.user.image}
                      alt={profileData.user.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {profileData.user.name || "User"}
                  </h2>
                  <p className="text-muted-foreground">
                    {profileData.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Joined{" "}
                    {format(new Date(profileData.user.createdAt), "MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {bio || "No bio yet. Click edit to add one!"}
                  </p>
                )}
              </div>

              {isEditing && (
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          <Card>
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {profileData.stats.currentStreak} days
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Longest Streak</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {profileData.stats.longestStreak} days
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Courses Completed</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {profileData.stats.coursesCompleted}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Watch Time</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {profileData.stats.totalWatchTime}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Courses */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.completedCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No completed courses yet
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileData.completedCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
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
  );
}
