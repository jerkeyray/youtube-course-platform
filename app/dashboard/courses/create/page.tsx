"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateCourse() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      description: formData.get("description") as string,
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
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Course Title
          </label>
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
          <Input
            id="playlistUrl"
            name="playlistUrl"
            required
            type="url"
            placeholder="https://www.youtube.com/playlist?list=..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description (Optional)
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter course description"
            className="w-full"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </div>
  );
}
