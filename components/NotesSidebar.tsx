"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Note {
  id: string;
  timestampSeconds: number;
  content: string;
}

interface NotesSidebarProps {
  courseId: string;
  videoId: string;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NotesSidebar({
  courseId,
  videoId,
  getCurrentTime,
  seekTo,
  isOpen,
  onOpenChange,
  className,
}: NotesSidebarProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null
  );
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right");

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["notes", videoId],
    queryFn: async () => {
      const res = await fetch(`/api/notes?videoId=${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  const addNoteMutation = useMutation<
    Note,
    Error,
    { timestamp: number; content: string },
    { previousNotes?: Note[]; optimisticId: string }
  >({
    mutationFn: async ({
      timestamp,
      content,
    }: {
      timestamp: number;
      content: string;
    }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          videoId,
          timestampSeconds: Math.floor(timestamp),
          content,
        }),
      });
      if (!res.ok) {
        let message = "Failed to save moment";
        try {
          const json = await res.json();
          if (typeof json?.error === "string") message = json.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      return (await res.json()) as Note;
    },
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: ["notes", videoId] });
      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        videoId,
      ]);

      const optimisticId = "temp-" + Date.now();

      queryClient.setQueryData<Note[]>(["notes", videoId], (old) => {
        const optimisticNote: Note = {
          id: optimisticId,
          timestampSeconds: Math.floor(newNote.timestamp),
          content: newNote.content,
        };
        const newNotes = [...(old || []), optimisticNote];
        return newNotes.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
      });

      setNewNoteContent("");
      return { previousNotes: previousNotes ?? undefined, optimisticId };
    },
    onSuccess: (createdNote, _newNote, context) => {
      const { id, timestampSeconds, content } = createdNote;

      queryClient.setQueryData<Note[]>(["notes", videoId], (old) => {
        if (!old?.length || !context?.optimisticId) return old;
        return old
          .map((n) =>
            n.id === context.optimisticId
              ? { id, timestampSeconds, content }
              : n
          )
          .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
      });
    },
    onError: (err, newNote, context) => {
      queryClient.setQueryData(["notes", videoId], context?.previousNotes);
      toast.error(err instanceof Error ? err.message : "Failed to save moment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", videoId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) {
        let message = "Failed to delete note";
        try {
          const json = await res.json();
          if (typeof json?.error === "string") message = json.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", videoId] });
      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        videoId,
      ]);
      queryClient.setQueryData<Note[]>(["notes", videoId], (old) =>
        old?.filter((note) => note.id !== noteId)
      );
      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      queryClient.setQueryData(["notes", videoId], context?.previousNotes);
      toast.error(err instanceof Error ? err.message : "Failed to delete note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", videoId] });
    },
  });

  const handleAddNote = () => {
    const content = newNoteContent.trim();
    if (!content) return;
    const time = getCurrentTime();
    addNoteMutation.mutate({ timestamp: time || 0, content });
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const apply = () => setSheetSide(mql.matches ? "bottom" : "right");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className={cn("p-0", className)} side={sheetSide}>
        <SheetHeader className="border-b">
          <SheetTitle>Saved moments</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 p-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notes?.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm mt-10 px-4">
              <p>No saved moments yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes?.map((note) => {
                const isOptimistic = note.id.startsWith("temp-");
                const isHighlighted = highlightedNoteId === note.id;
                const label = note.content?.trim();

                return (
                  <div
                    key={note.id}
                    className={cn(
                      "group relative border rounded-md p-3 transition-colors cursor-pointer bg-card",
                      isHighlighted ? "bg-accent/50" : "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      seekTo(note.timestampSeconds);
                      setHighlightedNoteId(note.id);
                      window.setTimeout(() => setHighlightedNoteId(null), 800);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {formatTime(note.timestampSeconds)}
                      </span>
                      <p
                        className={cn(
                          "text-sm truncate flex-1",
                          label ? "text-foreground/90" : "text-muted-foreground"
                        )}
                      >
                        {label || "Saved moment"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleteNoteMutation.isPending || isOptimistic}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOptimistic) return;
                          deleteNoteMutation.mutate(note.id);
                        }}
                        aria-label="Delete moment"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a note…"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              maxLength={120}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              className="text-sm"
            />
            <Button
              size="icon"
              onClick={handleAddNote}
              disabled={addNoteMutation.isPending}
              className="shrink-0"
              aria-label="Save moment"
              title="Save"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to save
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
