import { auth } from "@/lib/auth-compat";
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

    const { watchLater } = await req.json();
    const { videoId } = await context.params;

    if (watchLater) {
      // Add to watch later
      const watchLaterEntry = await prisma.watchLater.upsert({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
        update: {},
        create: {
          userId,
          videoId,
        },
      });
      return NextResponse.json(watchLaterEntry);
    } else {
      // Remove from watch later
      await prisma.watchLater.delete({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });
      return new NextResponse(null, { status: 204 });
    }
  } catch (error) {
    // console.error("[WATCH_LATER]", error);
    return NextResponse.json(
      { error: "Failed to update watch later status" },
      { status: 500 }
    );
  }
}
