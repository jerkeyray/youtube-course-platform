"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

interface CourseCreateResponse {
  id?: string;
  error?: string;
}

export function NewCourseForm() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the YouTube playlist URL
    const playlistId = playlistUrl.match(/[&?]list=([^&]+)/)?.[1];
    if (!playlistId) {
      toast.error("Please enter a valid YouTube playlist URL");
      return;
    }

    // Validate course name
    if (!courseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseName.trim(),
          playlistUrl,
        }),
      });

      const data = (await res.json()) as CourseCreateResponse;

      if (res.ok && data.id) {
        toast.success("Course created successfully!");
        router.push(`/courses/${data.id}`);
      } else {
        toast.error(data.error ?? "Something went wrong creating the course.");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      toast.error(
        err instanceof Error
          ? `Failed to create course: ${err.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="courseName">Course Name</Label>
        <Input
          id="courseName"
          type="text"
          placeholder="Enter a name for your course"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="playlistUrl">YouTube Playlist URL</Label>
        <Input
          id="playlistUrl"
          type="url"
          placeholder="https://www.youtube.com/playlist?list=..."
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-muted-foreground text-xs">
          Enter the URL of a YouTube playlist to create a course
        </p>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Creating..." : "Create Course"}
        </Button>
        <Link href="/courses">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="w-full"
          >
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
