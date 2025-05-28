"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  type?: "watch-later" | "bookmark";
}

export default function VideoCard({
  video,
  onRemove,
  type = "watch-later",
}: VideoCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = React.useState(video.thumbnailUrl);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const endpoint =
        type === "watch-later"
          ? `/api/videos/${video.id}/watch-later`
          : `/api/bookmarks/${video.youtubeId}`;

      const response = await fetch(endpoint, {
        method: type === "watch-later" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        ...(type === "watch-later" && {
          body: JSON.stringify({
            watchLater: false,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from ${type}`);
      }

      toast.success(`Removed from ${type}`);
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      toast.error(`Failed to remove from ${type}`);
    }
  };

  // Debug: log the video prop
  console.log("VideoCard video:", video);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md flex flex-col",
        "h-[340px]" // Fixed height for consistency
      )}
      onClick={() =>
        router.push(`/dashboard/courses/${video.courseId}?video=${video.id}`)
      }
    >
      <div className="relative aspect-video flex-shrink-0">
        <Image
          src={imgSrc}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          onError={() => {
            // Fallback to a lower quality thumbnail if the high quality one fails
            setImgSrc(
              `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`
            );
          }}
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {video.duration}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow justify-between min-h-0">
        <div>
          <h3 className="font-medium text-base mb-1 line-clamp-2 min-h-[2.5rem]">
            {video.title}
          </h3>
          <p
            className="text-sm font-semibold text-blue-700 line-clamp-1 mb-1"
            title={video.courseTitle || "Unknown Course"}
          >
            {video.courseTitle || "Unknown Course"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {type === "watch-later" ? "Watch Later" : "Bookmark"}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
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
