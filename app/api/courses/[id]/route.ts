// /app/api/courses/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseId = params.id;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Delete course and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // First delete all bookmarks for videos in this course
      await tx.bookmark.deleteMany({
        where: {
          video: {
            courseId,
          },
        },
      });

      // Delete all watch later entries for videos in this course
      await tx.watchLater.deleteMany({
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
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const course = await prisma.course.update({
      where: {
        id: params.id,
        userId,
      },
      data: {
        title,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
