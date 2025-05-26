import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

type NoteData = {
  id: number;
  content: string;
  videoId?: number | null;
  courseId?: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type UseNotesProps = {
  videoId?: number;
  courseId?: number;
};

export default function useNotes({ videoId, courseId }: UseNotesProps) {
  const queryClient = useQueryClient();

  const queryKey: [string, string, number] | null = videoId
    ? ["note", "video", videoId]
    : courseId
      ? ["note", "course", courseId]
      : null;

  // Query for fetching note
  const {
    data: note,
    isLoading: loading,
    error,
  }: UseQueryResult<NoteData | null, Error> = useQuery({
    queryKey: queryKey ?? [],
    queryFn: async (): Promise<NoteData | null> => {
      if (!videoId && !courseId) return null;

      const queryParams = new URLSearchParams();
      if (videoId) queryParams.append("videoId", videoId.toString());
      if (courseId) queryParams.append("courseId", courseId.toString());

      const response = await fetch(`/api/notes?${queryParams.toString()}`);

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Failed to fetch note");
      }

      const data = await response.json() as { note?: NoteData | null };
      return data.note ?? null;
    },
    enabled: !!queryKey,
  });

  // Save note mutation
  const { mutate: saveNote }: UseMutationResult<NoteData, Error, string> =
    useMutation({
      mutationFn: async (content: string) => {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, videoId, courseId }),
        });

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error ?? "Failed to save note");
        }

        const data = await response.json() as { note: NoteData };
        return data.note;
      },
      onSuccess: (newNote) => {
        if (queryKey) {
          queryClient.setQueryData(queryKey, newNote);
        }
      },
    });

  // Delete note mutation
  const { mutate: deleteNote }: UseMutationResult<number, Error, void> =
    useMutation({
      mutationFn: async () => {
        if (!note?.id) {
          throw new Error("No note to delete");
        }

        const response = await fetch(`/api/notes/${note.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error ?? "Failed to delete note");
        }

        return note.id;
      },
      onSuccess: () => {
        if (queryKey) {
          queryClient.setQueryData(queryKey, null);
        }
      },
    });

  return {
    note,
    loading,
    error: error?.message ?? null,
    saveNote,
    deleteNote,
    refreshNote: () => {
      if (queryKey) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  };
}
