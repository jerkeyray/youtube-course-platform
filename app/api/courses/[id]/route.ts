// /app/api/courses/[id]/route.ts

import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server"; // Keep commented if Request is used
import { auth } from "@/lib/auth-compat"; // Reverted to original, will fix if it's an issue later
import { prisma } from "@/lib/prisma";
// import type { Prisma } from "@prisma/client"; // Keep commented if not used

// GET specific course by ID
export async function GET(
  req: Request, // Can be NextRequest if specific Next.js functionalities are needed
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the course
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
        category: true, // Include category if you have one
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    // console.error("[COURSE_GET_BY_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT (update) a specific course by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, playlistId, categoryId, deadline, isPublic } =
      body;

    // Optional: Add validation for the incoming data here

    const course = await prisma.course.updateMany({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the course
      },
      data: {
        title,
        description,
        playlistId,
        categoryId,
        deadline: deadline ? new Date(deadline) : null,
        isPublic,
        updatedAt: new Date(),
      },
    });

    // updateMany does not return the updated record directly in the same way as update.
    // It returns a count. If you need the updated record, you might need to fetch it again
    // or use prisma.course.update if you are sure about the uniqueness for the user.
    if (course.count === 0) {
      return new NextResponse(
        "Course not found or user not authorized to update",
        { status: 404 }
      );
    }

    // Fetch the updated course to return it
    const updatedCourse = await prisma.course.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    // console.error("[COURSE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE a specific course by ID
export async function DELETE(
  request: Request, // Using generic Request as per original structure
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
      return new NextResponse("Course not found or not owned by user", {
        status: 404,
      });
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
    // console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.update({
      where: { id: params.id, userId },
      data: body,
    });

    return NextResponse.json(course);
  } catch (error) {
    // console.error("[COURSE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
