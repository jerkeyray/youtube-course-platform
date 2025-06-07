import { auth } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const { id } = await params;

  const note = await db.note.findUnique({
    where: {
      id,
      userId,
    },
    include: {
      video: {
        select: {
          title: true,
          videoId: true,
        },
      },
      course: {
        select: {
          title: true,
          id: true,
        },
      },
    },
  });

  if (!note) {
    return redirect("/dashboard/notes");
  }

  if (!note.course) {
    return redirect("/dashboard/notes");
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-x-2 mb-6">
          <Link href="/dashboard/notes">
            <Button
              variant="default"
              className="bg-black hover:bg-black/80 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <BookOpen className="h-4 w-4" />
          <Link
            href={`/dashboard/courses/${note.course.id}`}
            className="hover:underline"
          >
            {note.course.title}
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {note.title || "Untitled Note"}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Last updated {format(new Date(note.updatedAt), "MMMM d, yyyy")}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
