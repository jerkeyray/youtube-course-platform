import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VideoStatusType } from "@prisma/client";

interface VideoStatus {
  id: number;
  userId: number;
  videoId: number;
  status: VideoStatusType;
  updatedAt: string;
}

export function useVideoStatuses(courseId: number) {
  const queryClient = useQueryClient();

  // Query for fetching video statuses
  const {
    data: videoStatuses = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["videoStatuses", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/videos/status?courseId=${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video statuses");
      }
      const data = await response.json();

      // Create a map of videoId -> status
      const statusMap: Record<number, VideoStatusType> = {};
      data.videoStatuses.forEach((status: VideoStatus) => {
        statusMap[status.videoId] = status.status;
      });
      return statusMap;
    },
  });

  // Mutation for updating video status
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      videoId,
      status,
    }: {
      videoId: number;
      status: VideoStatusType;
    }) => {
      const response = await fetch("/api/videos/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update video status");
      }

      return { videoId, status };
    },
    onSuccess: (data) => {
      // Update the cache with the new status
      queryClient.setQueryData(
        ["videoStatuses", courseId],
        (oldData: Record<number, VideoStatusType> = {}) => ({
          ...oldData,
          [data.videoId]: data.status,
        }),
      );
    },
  });

  return {
    videoStatuses,
    isLoading,
    error,
    updateStatus,
    isUpdating,
  };
}
