import { NextResponse } from "next/server";
import { auth, currentUser } from "@/lib/auth-compat";
import { prisma } from "@/lib/prisma";
import {
  extractVideoId,
  fetchPlaylistDetails,
  fetchSingleVideoDetails,
} from "@/lib/youtube";
import { z } from "zod";
import { parseChaptersFromDescription } from "@/lib/chapters";

const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long")
    .trim(),
  playlistUrl: z
    .string()
    .url("Invalid playlist URL")
    .refine((url) => url.includes("youtube.com") || url.includes("youtu.be"), {
      message: "Invalid YouTube URL",
    }),
  deadline: z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .optional()
    .refine((val) => !val || new Date(val) > new Date(), {
      message: "Deadline must be in the future",
    }),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createCourseSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      );
    }

    const url = validatedData.data.playlistUrl;
    const playlistIdMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const playlistId = playlistIdMatch?.[1] ?? null;

    // If it's a playlist URL, keep the existing multi-video course flow.
    if (playlistId) {
      let playlistDetails;
      try {
        playlistDetails = await fetchPlaylistDetails(playlistId);
      } catch {
        return NextResponse.json(
          {
            error:
              "Failed to fetch playlist details. Please check the URL or try again later.",
          },
          { status: 400 }
        );
      }

      const course = await prisma.$transaction(async (tx) => {
        const dbUser = await tx.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            name: user.fullName || user.firstName || "User",
          },
          update: {
            email: user.primaryEmailAddress?.emailAddress ?? null,
            name: user.fullName || user.firstName || "User",
          },
        });

        const course = await tx.course.create({
          data: {
            title: validatedData.data.title,
            playlistId,
            userId: dbUser.id,
            deadline: validatedData.data.deadline
              ? new Date(validatedData.data.deadline)
              : null,
          },
        });

        if (playlistDetails.videos.length > 0) {
          await tx.video.createMany({
            data: playlistDetails.videos.map((video, index) => ({
              title: video.title,
              videoId: video.youtubeId,
              order: index,
              courseId: course.id,
            })),
          });
        }

        return course;
      });

      return NextResponse.json(course, { status: 201 });
    }

    // Otherwise, treat it as a single-video chapter course.
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    let details;
    try {
      details = await fetchSingleVideoDetails(videoId);
    } catch {
      return NextResponse.json(
        {
          error:
            "Failed to fetch video details. Please check the URL or try again later.",
        },
        { status: 400 }
      );
    }

    const chapters = parseChaptersFromDescription({
      description: details.description,
      durationSeconds: details.durationSeconds,
    });

    if (chapters.length === 0) {
      return NextResponse.json(
        {
          error: "Cannot make single video course for video without timestamp",
        },
        { status: 400 }
      );
    }

    const course = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          name: user.fullName || user.firstName || "User",
        },
        update: {
          email: user.primaryEmailAddress?.emailAddress ?? null,
          name: user.fullName || user.firstName || "User",
        },
      });

      const course = await tx.course.create({
        data: {
          title: validatedData.data.title,
          // Course.playlistId is required in the schema; store a non-colliding marker for video courses.
          playlistId: `video:${videoId}`,
          userId: dbUser.id,
          deadline: validatedData.data.deadline
            ? new Date(validatedData.data.deadline)
            : null,
        },
      });

      const video = await tx.video.create({
        data: {
          title: details.title,
          videoId,
          order: 0,
          courseId: course.id,
          description: details.description,
          durationSeconds: details.durationSeconds,
        },
      });

      await tx.chapter.createMany({
        data: chapters.map((c) => ({
          videoId: video.id,
          title: c.title,
          startSeconds: c.startSeconds,
          endSeconds: c.endSeconds,
          order: c.order,
        })),
      });

      return course;
    });

    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create course. Please try again later." },
      { status: 500 }
    );
  }
}
