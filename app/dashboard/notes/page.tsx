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
    <div className="min-h-screen bg-black text-white">
      <main className="container py-8 px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">My Notes</h1>
          <p className="text-gray-400">All your notes from course videos</p>
        </div>

        <NotesList initialNotes={notes} />
      </main>
    </div>
  );
}
