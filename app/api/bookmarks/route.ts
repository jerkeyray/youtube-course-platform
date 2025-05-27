import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { video: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("[BOOKMARKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { videoId, note } = await req.json();
    if (!videoId) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingBookmark) {
      return new NextResponse("Bookmark already exists", { status: 400 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        videoId,
        note,
      },
      include: { video: true },
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("[BOOKMARKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
