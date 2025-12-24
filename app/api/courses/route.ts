// /app/api/courses/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { extractPlaylistId, fetchPlaylistDetails } from "@/lib/youtube";
import type { Course, Video, VideoProgress } from "@prisma/client";
import { z } from "zod";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

type CourseWithVideosAndProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
};

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = (await db.course.findMany({
      where: { userId },
      include: {
        videos: {
          select: {
            id: true,
            progress: {
              where: { userId },
              select: { completed: true },
            },
          },
        },
      },
    })) as CourseWithVideosAndProgress[];

    const coursesWithCompletion: CourseWithProgress[] = courses.map(
      (course) => {
        const totalVideos = course.videos.length;
        const completedVideos = course.videos.filter((video) =>
          video.progress.some((p) => p.completed)
        ).length;

        const completionPercentage =
          totalVideos > 0
            ? Math.round((completedVideos / totalVideos) * 100)
            : 0;

        return {
          ...course,
          completionPercentage,
        };
      }
    );

    return NextResponse.json({ courses: coursesWithCompletion });
  } catch (error) {
    // console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, deadline } = (await req.json()) as {
    url: string;
    deadline?: string;
  };
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return NextResponse.json(
      { error: "Invalid playlist URL" },
      { status: 400 }
    );
  }

  try {
    const { title, videos } = await fetchPlaylistDetails(playlistId);

    const course = await db.course.create({
      data: {
        title,
        playlistId,
        userId,
        deadline: deadline ? new Date(deadline) : null,
        videos: {
          create: videos.map((video, index) => ({
            title: video.title,
            videoId: video.youtubeId,
            order: index,
          })),
        },
      },
      include: {
        videos: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    // console.error("Error creating course:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
