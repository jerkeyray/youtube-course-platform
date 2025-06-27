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
      <main className="py-12 px-4 sm:px-8 md:pl-60 max-w-5xl mx-auto">
        <div className="mb-10 pt-6 pb-6 border-b border-zinc-800 shadow-sm">
          <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight">
            My Notes
          </h1>
          <p className="text-gray-400 text-lg">
            All your notes from course videos
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-6">
          <NotesList initialNotes={notes} />
        </div>
      </main>
    </div>
  );
}
