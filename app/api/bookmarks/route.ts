import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        video: {
          include: {
            course: true, // Include course details
          },
        },
      },
    });

    // Transform the data to match the expected VideoCard format
    const formattedBookmarks = bookmarks.map((bookmark) => {
      return {
        id: bookmark.video.id,
        title: bookmark.video.title,
        thumbnailUrl: `https://img.youtube.com/vi/${bookmark.video.videoId}/maxresdefault.jpg`,
        duration: "00:00", // This may need to be fetched from YouTube API if required
        youtubeId: bookmark.video.videoId,
        courseTitle: bookmark.video.course?.title || "Unknown Course",
        courseId: bookmark.video.courseId,
      };
    });

    return NextResponse.json(formattedBookmarks);
  } catch (_error) {
    // console.error("Error fetching bookmarks:", _error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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
          userId: session.user.id,
          videoId,
        },
      },
    });

    if (existingBookmark) {
      return new NextResponse("Bookmark already exists", { status: 400 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        videoId,
        note,
      },
      include: { video: true },
    });

    return NextResponse.json(bookmark);
  } catch (_error) {
    // console.error("Error creating bookmark:", _error);
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", errors: _error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
