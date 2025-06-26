"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Youtube } from "lucide-react";
import { parse, isValid, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

export default function CreateCourse() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [dateInput, setDateInput] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please sign in to create a course");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      playlistUrl: formData.get("playlistUrl") as string,
      deadline: deadline?.toISOString(),
    };

    try {
      const response = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      const course = await response.json();
      toast.success("Course created successfully!");
      router.push(`/dashboard/courses/${course.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="container max-w-2xl py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Create New Course
              </h1>
              <p className="text-gray-400 mt-1">
                Add a YouTube playlist to start learning
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              asChild
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <Card className="shadow-lg bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-white"
                  >
                    Course Title
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    This will appear on your completion certificate
                  </p>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="Enter course title"
                    className="w-full bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="playlistUrl"
                    className="text-sm font-medium text-white"
                  >
                    YouTube Playlist URL
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Paste the URL of your YouTube playlist
                  </p>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="playlistUrl"
                      name="playlistUrl"
                      required
                      type="url"
                      placeholder="https://www.youtube.com/playlist?list=..."
                      className="w-full pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="deadline"
                    className="text-sm font-medium text-white"
                  >
                    Completion Deadline
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Set a target date to complete the course (optional,
                    MM/DD/YYYY)
                  </p>
                  <Input
                    id="deadline"
                    type="text"
                    value={dateInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDateInput(val);
                      if (!val) {
                        setDeadline(undefined);
                        return;
                      }
                      const parsed = parse(val, "MM/dd/yyyy", new Date());
                      if (isValid(parsed) && !isBefore(parsed, new Date())) {
                        setDeadline(parsed);
                      } else {
                        setDeadline(undefined);
                      }
                    }}
                    placeholder="MM/DD/YYYY"
                    className="w-full bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">Creating...</span>
                    </div>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
