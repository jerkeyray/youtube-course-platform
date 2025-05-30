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
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container max-w-2xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground mt-1">
              Add a YouTube playlist to start learning
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Course Title
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  This will appear on your completion certificate
                </p>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Enter course title"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="playlistUrl" className="text-sm font-medium">
                  YouTube Playlist URL
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Paste the URL of your YouTube playlist
                </p>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="playlistUrl"
                    name="playlistUrl"
                    required
                    type="url"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">
                  Completion Deadline
                </label>
                <p className="text-xs text-muted-foreground mb-2">
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
                  className="w-full"
                  autoComplete="off"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
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
  );
}
