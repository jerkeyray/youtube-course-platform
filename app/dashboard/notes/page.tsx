import { auth } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NotesList from "./notes-list";

export default async function NotesPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const notes = await db.note.findMany({
    where: {
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
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Notes</h1>
        <p className="text-muted-foreground">
          All your notes from course videos
        </p>
      </div>

      <NotesList initialNotes={notes} />
    </main>
  );
}
