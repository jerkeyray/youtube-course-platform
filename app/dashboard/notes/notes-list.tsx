"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Search, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  videoId: string | null;
  courseId: string | null;
  userId: string;
  video: {
    title: string;
    videoId: string;
  } | null;
  course: {
    title: string;
  } | null;
}

interface NotesListProps {
  initialNotes: Note[];
}

const NotesList = ({ initialNotes }: NotesListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [notes, setNotes] = useState(initialNotes);

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleEdit = (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/dashboard/notes/${noteId}/edit`;
  };

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          (note.title?.toLowerCase().includes(query) ?? false) ||
          note.content.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [notes, searchQuery, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Search & Sort Bar in Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm mb-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
            />
          </div>
          <Select
            value={sortOrder}
            onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Sort by date" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem
                value="newest"
                className="text-white hover:bg-zinc-800"
              >
                Newest first
              </SelectItem>
              <SelectItem
                value="oldest"
                className="text-white hover:bg-zinc-800"
              >
                Oldest first
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedNotes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
          <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-blue-500 mb-6" />
              <p className="text-xl text-gray-300 font-semibold text-center mb-2">
                {searchQuery
                  ? "No notes found matching your search."
                  : "You haven't created any notes yet."}
              </p>
              {!searchQuery && (
                <p className="text-gray-400 text-center">
                  Start taking notes while watching course videos!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedNotes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 bg-zinc-900 border-zinc-800 hover:border-blue-500 relative overflow-hidden group">
                {/* Blue left border accent */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700 group-hover:from-blue-400 group-hover:to-blue-600 transition-all duration-200" />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2 text-white text-lg font-bold">
                        {note.title || "Untitled Note"}
                      </CardTitle>
                      {note.course?.title && (
                        <span className="inline-block bg-zinc-800 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                          {note.course.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-zinc-800"
                        onClick={(e) => handleEdit(note.id, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-zinc-800"
                        onClick={(e) => handleDelete(note.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {note.content}
                    </p>
                    <span className="inline-block bg-zinc-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      Last updated{" "}
                      {format(new Date(note.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;
