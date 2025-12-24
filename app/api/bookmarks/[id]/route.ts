import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Prefer treating `id` as the internal Video.id to avoid collisions.
    // Fallback to legacy behavior where `id` is the YouTube video id.
    const videoRecord =
      (await prisma.video.findUnique({ where: { id } })) ??
      (await prisma.video.findFirst({ where: { videoId: id } }));

    if (!videoRecord) {
      return new NextResponse("Video not found in database", { status: 404 });
    }

    // Find the bookmark using the user's ID and the internal video ID
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: videoRecord.id,
        },
      },
    });

    if (!bookmark) {
      return new NextResponse("Bookmark not found", { status: 404 });
    }

    // Delete the bookmark
    await prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });

    return NextResponse.json({ message: "Bookmark deleted" }, { status: 200 });
  } catch {
    // console.error("Error deleting bookmark:", _error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
