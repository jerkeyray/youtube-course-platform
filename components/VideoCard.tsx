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
    thumbnailUrl?: string; // Made optional as we have a fallback
    duration?: string; // Made optional as we conditionally render it
    youtubeId: string;
    courseTitle?: string;
    courseId?: string;
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
  const [imgSrc, setImgSrc] = React.useState(
    video.thumbnailUrl ||
      `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
  );

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const endpoint =
        type === "watch-later"
          ? `/api/videos/${video.id}/watch-later`
          : `/api/bookmarks/${video.youtubeId}`;

      // Debug the endpoint
      // eslint-disable-next-line no-console
      console.log(`Removing ${type} with endpoint: ${endpoint}`);

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

      if (response.status === 404) {
        toast.info(`Already removed from ${type}`);
        if (onRemove) {
          onRemove();
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to remove from ${type}`);
      }

      toast.success(`Successfully removed from ${type}`);
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error removing from ${type}:`, error);
      toast.error(`Failed to remove from ${type}`);
    }
  };

  // Debug: log the video prop
  // console.log("VideoCard video:", video);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/50 flex flex-col w-full max-w-xs mx-auto cursor-pointer"
      )}
      onClick={() => {
        if (video.courseId) {
          router.push(
            `/dashboard/courses/${video.courseId}?videoId=${video.id}`
          );
        } else {
          toast.error("Course information is missing for this video");
          // eslint-disable-next-line no-console
          console.error("Missing courseId for video:", video);
        }
      }}
    >
      <div className="relative aspect-[16/9] flex-shrink-0">
        <Image
          src={imgSrc}
          alt={video.title || "Video thumbnail"}
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
        {video.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white font-medium">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between min-h-0">
        <div>
          <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[2.5rem] text-white group-hover:text-blue-400 transition-colors duration-200">
            {video.title}
          </h3>
          <p
            className="text-sm font-medium text-blue-400 line-clamp-1 mb-2"
            title={video.courseTitle || "Unknown Course"}
          >
            {video.courseTitle || "Unknown Course"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="mr-2 h-4 w-4" />
            {type === "watch-later" ? "Watch Later" : "Bookmark"}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-900/30 hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
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
