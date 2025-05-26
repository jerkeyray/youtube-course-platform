import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchPlaylistDetails } from "@/lib/youtube";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  deadline: z.string().datetime().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "You must be logged in to update a course" },
        { status: 401 }
      );
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.userId !== session.userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this course" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        deadline: validatedData.deadline
          ? new Date(validatedData.deadline)
          : undefined,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update course. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "You must be logged in to delete a course" },
        { status: 401 }
      );
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.userId !== session.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this course" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course. Please try again later." },
      { status: 500 }
    );
  }
}
