"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { use } from "react";
import LoadingScreen from "@/components/LoadingScreen";

interface EditNotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditNotePage({ params }: EditNotePageProps) {
  const router = useRouter();
  const { id: noteId } = use(params);
  const [note, setNote] = useState<{
    title: string | null;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;

      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) throw new Error("Failed to fetch note");
        const data = await response.json();
        setNote({
          title: data.title,
          content: data.content,
        });
      } catch (error) {
        toast.error("Failed to load note");
        router.push("/dashboard/notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, router]);

  const handleSave = async () => {
    if (!note || !noteId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) throw new Error("Failed to save note");

      toast.success("Note saved successfully");
      router.push(`/dashboard/notes/${noteId}`);
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container py-8">
        <LoadingScreen variant="fullscreen" />
      </main>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-x-2 mb-6">
          <Link href={`/dashboard/notes/${noteId}`}>
            <Button
              variant="default"
              className="bg-black hover:bg-black/80 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Note
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Note title (optional)"
              value={note.title || ""}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
              className="text-lg font-medium"
            />
            <Textarea
              placeholder="Write your note in markdown..."
              value={note.content}
              onChange={(e) => setNote({ ...note, content: e.target.value })}
              className="min-h-[400px] font-mono"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black hover:bg-black/80 text-white"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4">
                      <LoadingScreen variant="inline" />
                    </div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
