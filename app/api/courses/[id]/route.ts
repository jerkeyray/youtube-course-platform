// /app/api/courses/[id]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET specific course by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        videos: {
          orderBy: {
            order: "asc",
          },
          include: {
            progress: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch {
    // console.error("[COURSE_GET_BY_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT (update) a specific course by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, playlistId, deadline } = body;

    const course = await db.course.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        title,
        playlistId,
        deadline: deadline ? new Date(deadline) : null,
        updatedAt: new Date(),
      },
    });

    if (course.count === 0) {
      return new NextResponse(
        "Course not found or user not authorized to update",
        { status: 404 }
      );
    }

    const updatedCourse = await db.course.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedCourse);
  } catch {
    // console.error("[COURSE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE a specific course by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseId = id;

    // Verify course ownership
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found or not owned by user", {
        status: 404,
      });
    }

    // Delete course and all related data in a transaction
    await db.$transaction(async (tx) => {
      // Delete chapter progress for videos in this course
      await tx.chapterProgress.deleteMany({
        where: {
          chapter: {
            video: {
              courseId,
            },
          },
        },
      });

      // Delete chapters for videos in this course
      await tx.chapter.deleteMany({
        where: {
          video: {
            courseId,
          },
        },
      });

      // First delete all bookmarks for videos in this course
      await tx.bookmark.deleteMany({
        where: {
          video: {
            courseId,
          },
        },
      });

      // Delete all video progress for videos in this course
      await tx.videoProgress.deleteMany({
        where: {
          video: {
            courseId,
          },
        },
      });

      // Delete all certificates for this course
      await tx.certificate.deleteMany({
        where: {
          courseId,
        },
      });

      // Delete all videos for this course
      await tx.video.deleteMany({
        where: {
          courseId,
        },
      });

      // Finally delete the course
      await tx.course.delete({
        where: {
          id: courseId,
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    // console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await db.course.update({
      where: { id, userId },
      data: body,
    });

    return NextResponse.json(course);
  } catch {
    // console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
