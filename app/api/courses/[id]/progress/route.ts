import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const progressSchema = z.object({
  videoId: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to update progress" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { videoId } = progressSchema.parse(body);

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

    // Create or update progress
    await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: userId,
          videoId,
        },
      },
      create: {
        userId: userId,
        videoId,
        completed: true,
      },
      update: {
        completed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
