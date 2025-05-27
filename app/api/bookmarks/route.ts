import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getVideoDetails } from "@/lib/youtube";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            videoId: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data to match our VideoCard interface
    const videos = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const duration = await getVideoDetails(bookmark.video.videoId);
        return {
          id: bookmark.video.id,
          title: bookmark.video.title,
          thumbnailUrl: `https://img.youtube.com/vi/${bookmark.video.videoId}/hqdefault.jpg`,
          duration,
          youtubeId: bookmark.video.videoId,
          courseTitle: bookmark.video.course.title,
          courseId: bookmark.video.course.id,
          note: bookmark.note,
        };
      })
    );

    return NextResponse.json(videos);
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
