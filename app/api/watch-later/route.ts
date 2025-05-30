import { auth } from "@/lib/auth-compat";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVideoDetails } from "@/lib/youtube";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const watchLaterVideos = await prisma.watchLater.findMany({
      where: {
        userId,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match our VideoCard interface
    const videos = await Promise.all(
      watchLaterVideos.map(async (item) => {
        const duration = await getVideoDetails(item.video.videoId);
        return {
          id: item.video.id,
          title: item.video.title,
          thumbnailUrl: `https://img.youtube.com/vi/${item.video.videoId}/maxresdefault.jpg`,
          duration,
          youtubeId: item.video.videoId,
          courseTitle: item.video.course.title,
          courseId: item.video.course.id,
        };
      })
    );

    return NextResponse.json({ videos });
  } catch (error) {
    // console.error("[WATCH_LATER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch watch later videos" },
      { status: 500 }
    );
  }
}
