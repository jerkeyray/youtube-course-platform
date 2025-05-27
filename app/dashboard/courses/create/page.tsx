"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

export default function CreateCourse() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    setDeadline(date);
    setDateInput(date ? format(date, "MM/dd/yyyy") : "");
    setIsCalendarOpen(false);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);

    try {
      const parsedDate = parse(value, "MM/dd/yyyy", new Date());
      if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
        setDeadline(parsedDate);
      } else {
        setDeadline(undefined);
      }
    } catch {
      setDeadline(undefined);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Course Title (This is gonna be on the completion certificate)
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
          <label htmlFor="deadline" className="text-sm font-medium">
            Completion Deadline (Optional)
          </label>
          <div className="relative">
            <Input
              id="deadline"
              type="text"
              value={dateInput}
              onChange={handleDateInputChange}
              placeholder="MM/DD/YYYY"
              className="w-full pr-10"
            />
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date: Date) => date < new Date()}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter date manually (MM/DD/YYYY) or click the calendar icon
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </div>
  );
}
