import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chapterId } = await params;
  if (!chapterId) {
    return NextResponse.json(
      { error: "Chapter ID is required" },
      { status: 400 }
    );
  }

  // Ensure the chapter belongs to a course owned by the user.
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      video: {
        select: {
          course: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  if (chapter.video.course.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.chapterProgress.upsert({
    where: {
      userId_chapterId: {
        userId: session.user.id,
        chapterId,
      },
    },
    create: {
      userId: session.user.id,
      chapterId,
      completed: true,
      completedAt: new Date(),
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
