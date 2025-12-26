import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const momentLabelSchema = z
  .string()
  .max(120)
  .transform((s) => s.replace(/\s+/g, " ").trim());

const createNoteSchema = z.object({
  courseId: z.string(),
  videoId: z.string(),
  timestampSeconds: z.number().min(0),
  // Optional one-line label.
  content: momentLabelSchema.optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = createNoteSchema.parse(json);

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        ...body,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // eslint-disable-next-line no-console
    console.warn("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const courseId = searchParams.get("courseId");
    const all = searchParams.get("all") === "true";

    if (!videoId && !courseId && !all) {
      return NextResponse.json(
        { error: "videoId or courseId is required" },
        { status: 400 }
      );
    }

    const where: { userId: string; videoId?: string; courseId?: string } = {
      userId: session.user.id,
    };

    if (videoId) where.videoId = videoId;
    if (courseId) where.courseId = courseId;

    const notes = await prisma.note.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        video: { select: { id: true, title: true } },
      },
      orderBy: [
        { courseId: "asc" },
        { videoId: "asc" },
        { timestampSeconds: "asc" },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
