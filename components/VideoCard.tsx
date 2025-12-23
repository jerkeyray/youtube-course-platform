import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Play, Clock } from "lucide-react";
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
    timestamp?: number | null;
    createdAt?: Date | string;
  };
  onRemove?: () => void;
  type?: "default" | "bookmark";
}

export default function VideoCard({
  video,
  onRemove,
  type = "default",
}: VideoCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = React.useState(
    video.thumbnailUrl ||
      `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
  );

  const isBookmark = type === "bookmark";
  const isStale =
    isBookmark &&
    video.createdAt &&
    new Date().getTime() - new Date(video.createdAt).getTime() >
      7 * 24 * 60 * 60 * 1000; // 7 days old

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const endpoint = `/api/bookmarks/${video.youtubeId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        toast.info("Already removed from bookmarks");
        if (onRemove) {
          onRemove();
        }
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to remove from bookmarks");
      }

      toast.success("Successfully removed from bookmarks");
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error removing from bookmarks:", error);
      toast.error("Failed to remove from bookmarks");
    }
  };

  // Debug: log the video prop
  // console.log("VideoCard video:", video);

  return (
    <div
      className={cn(
        "group relative overflow-hidden border transition-all duration-200 flex flex-col w-full cursor-pointer",
        isBookmark
          ? "rounded-lg border-zinc-800 bg-zinc-900/50"
          : "rounded-xl border-zinc-800 bg-zinc-900",
        isStale
          ? "opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0"
          : "hover:border-zinc-700 hover:bg-zinc-800/50"
      )}
      onClick={() => {
        if (video.courseId) {
          router.push(
            `/dashboard/courses/${video.courseId}?videoId=${video.id}${
              video.timestamp ? `&t=${video.timestamp}` : ""
            }`
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
        {isBookmark && video.timestamp
          ? // Removed badge as requested to avoid YouTube-like visual noise
            // and rely on the primary action button for context
            null
          : video.duration && (
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white font-medium">
                {video.duration}
              </div>
            )}
      </div>
      <div
        className={cn(
          "flex flex-col flex-grow justify-between min-h-0",
          isBookmark ? "p-3" : "p-4"
        )}
      >
        <div>
          <h3
            className={cn(
              "mb-1 line-clamp-2 min-h-[2.5rem] text-white group-hover:text-blue-400 transition-colors duration-200",
              isBookmark ? "font-medium text-sm" : "font-semibold text-base"
            )}
          >
            {video.title}
          </h3>
          <p
            className={cn(
              "line-clamp-1 mb-2",
              isBookmark
                ? "text-xs text-zinc-500"
                : "text-sm font-medium text-blue-400"
            )}
            title={video.courseTitle || "Unknown Course"}
          >
            {video.courseTitle || "Unknown Course"}
          </p>
        </div>
        {isBookmark ? (
          <div className="mt-2 pt-0 flex items-center gap-2">
            <Button
              className="flex-1 bg-white text-black hover:bg-zinc-200 h-8 text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                if (video.courseId) {
                  router.push(
                    `/dashboard/courses/${video.courseId}?videoId=${video.id}${
                      video.timestamp ? `&t=${video.timestamp}` : ""
                    }`
                  );
                }
              }}
            >
              <Play className="w-3 h-3 mr-2" />
              {video.timestamp
                ? `Finish from ${formatTime(video.timestamp)}`
                : "Start Task"}
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                onClick={handleRemove}
                title="Abandon task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center text-sm text-gray-400">
              Bookmark
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-900/30 hover:text-red-400 transition-colors duration-200"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
