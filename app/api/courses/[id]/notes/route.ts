import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notesSchema = z.object({
  notes: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to save notes" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { notes } = notesSchema.parse(body);

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create or update notes
    await prisma.courseNotes.upsert({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: course.id,
        },
      },
      create: {
        userId: userId,
        courseId: course.id,
        content: notes,
      },
      update: {
        content: notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving notes:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save notes" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view notes" },
        { status: 401 }
      );
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get notes
    const notes = await prisma.courseNotes.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: course.id,
        },
      },
    });

    return NextResponse.json({ notes: notes?.content || "" });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
