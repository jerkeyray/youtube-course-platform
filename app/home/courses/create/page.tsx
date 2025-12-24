"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Youtube } from "lucide-react";
import { format, parse, isValid, isBefore } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

export default function CreateCourse() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    if (deadline) {
      setDateInput(format(deadline, "MM/dd/yyyy"));
    }
  }, [deadline]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInput(val);

    // Only attempt to parse if input length is sufficient (e.g., could be a full date)
    if (val.length >= 8) {
      const parsed = parse(val, "MM/dd/yyyy", new Date());
      if (isValid(parsed) && !isBefore(parsed, new Date())) {
        setDeadline(parsed);
      }
      // Don't unset deadline on invalid input immediately to avoid jumping UI,
      // but maybe we should if the user clears it?
      if (val === "") setDeadline(undefined);
    } else if (val === "") {
      setDeadline(undefined);
    }
  };

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
      router.push(`/home/courses/${course.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-white/5 -ml-4"
              asChild
            >
              <Link href="/home" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white">
              Create a course
            </h1>
            <p className="text-neutral-400 font-light text-lg">
              We'll process your playlist and organize it into a structured
              learning path. This usually takes a few moments.
            </p>
          </div>

          <Card className="border border-white/15 bg-[#0F0F0F] shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-neutral-200"
                  >
                    Course Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Introduction to TypeScript"
                    className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white h-12"
                  />
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="playlistUrl"
                    className="text-sm font-medium text-neutral-200"
                  >
                    YouTube Playlist URL
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Youtube className="h-5 w-5" />
                    </div>
                    <Input
                      id="playlistUrl"
                      name="playlistUrl"
                      required
                      type="url"
                      placeholder="https://youtube.com/playlist?list=..."
                      className="pl-10 bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white h-12"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Works with public YouTube playlists.
                  </p>
                </div>

                <div className="space-y-3 flex flex-col">
                  <label className="text-sm font-normal text-neutral-400">
                    Target Completion Date{" "}
                    <span className="text-neutral-500 font-normal ml-1">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    placeholder="MM/DD/YYYY"
                    value={dateInput}
                    onChange={handleDateInputChange}
                    className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-medium text-base transition-all border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4">
                          <LoadingScreen variant="inline" />
                        </div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create course"
                    )}
                  </Button>
                  <p className="text-xs text-neutral-500 text-center">
                    You can change details later.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
