import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: { videoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { completed } = await req.json();
    const { videoId } = await context.params;

    // Upsert the video progress
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        completed,
      },
      create: {
        userId,
        videoId,
        completed,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[VIDEO_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
