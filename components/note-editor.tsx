"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Save, X, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

interface NoteEditorProps {
  videoId: string;
  courseId: string;
}

export function NoteEditor({ videoId, courseId }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", videoId],
    queryFn: async () => {
      const response = await fetch(`/api/notes?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch note");
      }
      return response.json();
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (noteData: { content: string; title: string }) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          courseId,
          ...noteData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Note saved successfully");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setTitle(note.title || "");
    }
  }, [note]);

  if (isLoading) {
    return <LoadingScreen variant="contained" />;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            {note ? "Edit Note" : "Add Note"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="font-medium"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here... (Markdown supported)"
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => saveNoteMutation.mutate({ content, title })}
              disabled={saveNoteMutation.isPending}
              className="gap-2"
            >
              {saveNoteMutation.isPending ? (
                <LoadingScreen variant="inline" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Note
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {note?.title && (
            <h4 className="text-lg font-medium text-gray-900">{note.title}</h4>
          )}
          <div className="prose prose-sm max-w-none rounded-lg border bg-white p-4 shadow-sm">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">
                No notes yet. Click the button above to add some!
              </p>
            )}
          </div>
          {note && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                Last updated{" "}
                {format(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
