import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { videoId, courseId, content, title } = body;

    if (!videoId || !courseId || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the user has access to the course
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const existingNote = await db.note.findFirst({
      where: {
        userId,
        videoId,
      },
    });

    const note = await db.note.upsert({
      where: {
        id: existingNote?.id ?? "",
      },
      update: {
        content,
        title,
        courseId,
      },
      create: {
        userId,
        videoId,
        courseId,
        content,
        title,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    const note = await db.note.findFirst({
      where: {
        userId,
        videoId,
      },
      include: {
        video: {
          select: {
            title: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
