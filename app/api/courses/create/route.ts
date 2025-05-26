import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchPlaylistDetails } from "@/lib/youtube";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  playlistUrl: z.string().url("Invalid playlist URL"),
  deadline: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!session?.userId || !user) {
      return NextResponse.json(
        { error: "You must be logged in to create a course" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    // Extract playlist ID from URL
    const playlistId = validatedData.playlistUrl.match(/[&?]list=([^&]+)/)?.[1];
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid playlist URL" },
        { status: 400 }
      );
    }

    // Fetch playlist details
    const playlistDetails = await fetchPlaylistDetails(playlistId);

    // Create course with videos in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // First, ensure the user exists in our database
      const dbUser = await tx.user.upsert({
        where: { id: session.userId },
        create: {
          id: session.userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.firstName || "User",
        },
        update: {},
      });

      // Then create the course
      const course = await tx.course.create({
        data: {
          title: validatedData.title,
          playlistId,
          userId: dbUser.id,
          deadline: validatedData.deadline
            ? new Date(validatedData.deadline)
            : null,
        },
      });

      // Create the videos
      await tx.video.createMany({
        data: playlistDetails.videos.map((video, index) => ({
          title: video.title,
          videoId: video.youtubeId,
          order: index,
          courseId: course.id,
        })),
      });

      return course;
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create course. Please try again later." },
      { status: 500 }
    );
  }
}
