import { NextResponse } from "next/server";
import { auth, currentUser } from "@/lib/auth-compat";
import { prisma } from "@/lib/prisma";
import { fetchPlaylistDetails } from "@/lib/youtube";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long")
    .trim(),
  playlistUrl: z
    .string()
    .url("Invalid playlist URL")
    .refine(
      (url) =>
        /list=([a-zA-Z0-9_-]+)/.test(url) ||
        /youtu\.be\/.*list=([a-zA-Z0-9_-]+)/.test(url),
      "Invalid YouTube playlist URL"
    ),
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

    // Extract playlist ID
    const playlistIdMatch =
      validatedData.data.playlistUrl.match(/list=([a-zA-Z0-9_-]+)/) ||
      validatedData.data.playlistUrl.match(
        /youtu\.be\/.*list=([a-zA-Z0-9_-]+)/
      );
    const playlistId = playlistIdMatch?.[1];
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid playlist URL" },
        { status: 400 }
      );
    }

    // Fetch playlist details
    let playlistDetails;
    try {
      playlistDetails = await fetchPlaylistDetails(playlistId);
    } catch (error) {
      console.error("YouTube API error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to fetch playlist details. Please check the URL or try again later.",
        },
        { status: 400 }
      );
    }

    // Create course with videos in a transaction
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
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course. Please try again later." },
      { status: 500 }
    );
  }
}
