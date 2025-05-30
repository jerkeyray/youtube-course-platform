import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-compat";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const youtubeId = params.id;

    // First find the video by YouTube ID
    const video = await prisma.video.findFirst({
      where: {
        videoId: youtubeId,
      },
    });

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Then find and delete the bookmark
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        videoId: video.id,
      },
    });

    if (!bookmark) {
      return new NextResponse("Bookmark not found", { status: 404 });
    }

    await prisma.bookmark.delete({
      where: {
        userId_videoId: {
          userId,
          videoId: video.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
