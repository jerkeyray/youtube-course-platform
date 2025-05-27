"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bookmark, Video } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Link from "next/link";

interface BookmarkWithVideo extends Bookmark {
  video: Video;
  note: string | null;
}

export default function BookmarksPage() {
  const { userId } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkWithVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchBookmarks();
    }
  }, [userId]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bookmark");
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
      toast.success("Bookmark deleted");
    } catch (error) {
      toast.error("Failed to delete bookmark");
    }
  };

  if (isLoading) {
    return <div>Loading bookmarks...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No bookmarks yet. Add bookmarks while watching videos!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link
                    href={`/dashboard/courses/${bookmark.video.courseId}?video=${bookmark.videoId}`}
                    className="hover:underline"
                  >
                    {bookmark.video.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookmark.note && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {bookmark.note}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(bookmark.createdAt), "MMM d, yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
