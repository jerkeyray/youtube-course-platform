import React, { useState, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Lightbulb,
  HelpCircle,
  Sigma,
  FileText,
  Plus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Note {
  id: string;
  content: string;
  timestamp: number;
  type: "GENERAL" | "KEY_IDEA" | "CONFUSION" | "FORMULA" | "SUMMARY";
  createdAt: string;
}

interface NotesPanelProps {
  videoId: string;
  courseId: string;
  getCurrentTime: () => number;
  onSeek: (time: number) => void;
}

const NOTE_TYPES = [
  { id: "GENERAL", label: "General", icon: FileText, color: "text-zinc-400" },
  {
    id: "KEY_IDEA",
    label: "Key Idea",
    icon: Lightbulb,
    color: "text-yellow-400",
  },
  {
    id: "CONFUSION",
    label: "Confusion",
    icon: HelpCircle,
    color: "text-red-400",
  },
  { id: "FORMULA", label: "Formula", icon: Sigma, color: "text-blue-400" },
  { id: "SUMMARY", label: "Summary", icon: FileText, color: "text-green-400" },
] as const;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const NotesPanel = memo(function NotesPanel({
  videoId,
  courseId,
  getCurrentTime,
  onSeek,
}: NotesPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<Note["type"]>("GENERAL");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [capturedTime, setCapturedTime] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", videoId],
    queryFn: async () => {
      const res = await fetch(`/api/notes?videoId=${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json() as Promise<Note[]>;
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      timestamp: number;
      type: string;
    }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          courseId,
          ...data,
        }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", videoId] });
      setIsCreating(false);
      setNewNoteContent("");
      setNewNoteType("GENERAL");
      setCapturedTime(null);
      toast.success("Note saved");
    },
    onError: () => toast.error("Failed to save note"),
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: string; content: string; type: string }) => {
      const res = await fetch(`/api/notes/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.content,
          type: data.type,
        }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", videoId] });
      setEditingNoteId(null);
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update note"),
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", videoId] });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handleStartCreating = () => {
    setIsCreating(true);
    setCapturedTime(Math.floor(getCurrentTime()));
    // Focus textarea after render
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (!newNoteContent.trim()) return;

    if (editingNoteId) {
      updateNoteMutation.mutate({
        id: editingNoteId,
        content: newNoteContent,
        type: newNoteType,
      });
    } else {
      createNoteMutation.mutate({
        content: newNoteContent,
        timestamp: capturedTime ?? Math.floor(getCurrentTime()),
        type: newNoteType,
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNoteContent(note.content);
    setNewNoteType(note.type);
    setCapturedTime(note.timestamp);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNoteId(null);
    setNewNoteContent("");
    setNewNoteType("GENERAL");
    setCapturedTime(null);
  };

  // Dynamic prompt based on video progress
  const getPrompt = () => {
    if (notes.length === 0) return "Capture what you learned...";
    return "Add another note...";
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header / Create Area */}
      <div className="p-4 border-b border-zinc-800">
        {!isCreating ? (
          <Button
            onClick={handleStartCreating}
            className="w-full justify-start text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
            variant="ghost"
          >
            <Plus className="w-4 h-4 mr-2" />
            {getPrompt()}
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                  {formatTime(capturedTime ?? 0)}
                </span>
                <span className="text-xs text-zinc-500">
                  {editingNoteId ? "Editing note" : "New note"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Textarea
              ref={textareaRef}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[100px] bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSave();
                }
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {NOTE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = newNoteType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setNewNoteType(type.id)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isSelected
                          ? "bg-zinc-800 text-zinc-200"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                      )}
                      title={type.label}
                    >
                      <Icon
                        className={cn("w-4 h-4", isSelected && type.color)}
                      />
                    </button>
                  );
                })}
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  !newNoteContent.trim() ||
                  createNoteMutation.isPending ||
                  updateNoteMutation.isPending
                }
                className="bg-white text-black hover:bg-zinc-200"
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Loading notes...
            </div>
          ) : notes.length === 0 && !isCreating ? (
            <div className="text-center py-12 text-zinc-600">
              <p className="text-sm">No notes yet.</p>
              <p className="text-xs mt-1">Click above to add one.</p>
            </div>
          ) : (
            notes.map((note) => {
              const typeConfig =
                NOTE_TYPES.find((t) => t.id === note.type) || NOTE_TYPES[0];
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={note.id}
                  className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3 hover:border-zinc-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSeek(note.timestamp)}
                        className="text-xs font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded hover:bg-blue-400/20 transition-colors"
                      >
                        {formatTime(note.timestamp)}
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <TypeIcon className={cn("w-3 h-3", typeConfig.color)} />
                        <span>{typeConfig.label}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-32 bg-zinc-900 border-zinc-800"
                      >
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit2 className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none text-zinc-300 text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

export default NotesPanel;
