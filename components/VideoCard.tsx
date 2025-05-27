"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string;
    youtubeId: string;
    courseTitle: string;
    courseId: string;
  };
  onRemove?: () => void;
}

export default function VideoCard({ video, onRemove }: VideoCardProps) {
  const router = useRouter();

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/videos/${video.id}/watch-later`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          watchLater: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from watch later");
      }

      toast.success("Removed from watch later");
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      toast.error("Failed to remove from watch later");
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md h-[320px] flex flex-col"
      onClick={() =>
        router.push(`/dashboard/courses/${video.courseId}?video=${video.id}`)
      }
    >
      <div className="relative aspect-video flex-shrink-0">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {video.duration}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="line-clamp-2 font-medium text-base mb-1">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {video.courseTitle}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Watch Later
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
