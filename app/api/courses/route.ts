// /app/api/courses/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { extractPlaylistId, fetchPlaylistDetails } from "@/lib/youtube";
import { z } from "zod";

export const runtime = "nodejs";

type CourseSummary = {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalVideos: number;
  completedVideos: number;
  completionPercentage: number;
  nextVideoId: string | null;
};

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = await db.course.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        playlistId: true,
        userId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (courses.length === 0) {
      return NextResponse.json({ courses: [] satisfies CourseSummary[] });
    }

    const courseIds = courses.map((c) => c.id);

    const videos = await db.video.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true, order: true },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });

    const completedProgress = await db.videoProgress.findMany({
      where: {
        userId,
        completed: true,
        video: { courseId: { in: courseIds } },
      },
      select: {
        video: { select: { id: true, courseId: true, order: true } },
      },
    });

    const videosByCourse = new Map<
      string,
      Array<{ id: string; order: number }>
    >();
    for (const video of videos) {
      const list = videosByCourse.get(video.courseId) ?? [];
      list.push({ id: video.id, order: video.order });
      videosByCourse.set(video.courseId, list);
    }

    const completedAggByCourse = new Map<
      string,
      { completedVideos: number; lastCompletedOrder: number }
    >();
    for (const row of completedProgress) {
      const { courseId, order } = row.video;
      const prev = completedAggByCourse.get(courseId) ?? {
        completedVideos: 0,
        lastCompletedOrder: -1,
      };
      completedAggByCourse.set(courseId, {
        completedVideos: prev.completedVideos + 1,
        lastCompletedOrder: Math.max(prev.lastCompletedOrder, order),
      });
    }

    const summaries: CourseSummary[] = courses.map((course) => {
      const courseVideos = videosByCourse.get(course.id) ?? [];
      const totalVideos = courseVideos.length;
      const completedAgg = completedAggByCourse.get(course.id) ?? {
        completedVideos: 0,
        lastCompletedOrder: -1,
      };

      const completedVideosCount = Math.min(
        completedAgg.completedVideos,
        totalVideos
      );

      const completionPercentage =
        totalVideos > 0
          ? Math.round((completedVideosCount / totalVideos) * 100)
          : 0;

      let nextVideoId: string | null = null;
      if (totalVideos > 0) {
        const firstVideo = courseVideos[0];
        const lastVideo = courseVideos[totalVideos - 1];

        if (completedVideosCount === 0) {
          nextVideoId = firstVideo.id;
        } else if (completedAgg.lastCompletedOrder >= lastVideo.order) {
          nextVideoId = lastVideo.id;
        } else {
          nextVideoId =
            courseVideos.find((v) => v.order > completedAgg.lastCompletedOrder)
              ?.id ?? lastVideo.id;
        }
      }

      return {
        ...course,
        totalVideos,
        completedVideos: completedVideosCount,
        completionPercentage,
        nextVideoId,
      };
    });

    return NextResponse.json({ courses: summaries });
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
