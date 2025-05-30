import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  getVideoDetails,
  getPlaylistVideos,
  getPlaylistTitle,
} from "@/lib/youtube";

const updateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  deadline: z.string().datetime().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update a course" },
        { status: 401 }
      );
    }

    const courseOwner = await prisma.course.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!courseOwner) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (courseOwner.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this course" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.deadline && {
          deadline: new Date(validatedData.deadline),
        }),
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (_error) {
    // console.error("Error updating course:", _error);
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: _error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update course. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete a course" },
        { status: 401 }
      );
    }

    const courseOwner = await prisma.course.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!courseOwner) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (courseOwner.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this course" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    // console.error("Error deleting course:", _error);
    return NextResponse.json(
      { error: "Failed to delete course. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const playlistId = params.id;
    if (!playlistId) {
      return new NextResponse("Playlist ID is required", { status: 400 });
    }

    const playlistTitle = await getPlaylistTitle(playlistId);
    if (!playlistTitle) {
      return new NextResponse("Could not fetch playlist title", {
        status: 500,
      });
    }

    const course = await prisma.course.create({
      data: {
        userId: session.user.id,
        title: playlistTitle,
        playlistId: playlistId,
      },
    });

    const videos = await getPlaylistVideos(playlistId);
    if (!videos || videos.length === 0) {
      return NextResponse.json(course);
    }

    const videoData = await Promise.all(
      videos.map(async (video, index) => {
        const videoDetails = await getVideoDetails(video.id || "");
        return {
          title: video.title || "",
          videoId: video.id || "",
          order: index,
          duration: videoDetails && typeof videoDetails === 'object' && 'duration' in videoDetails ? (videoDetails as { duration: string }).duration : "PT0M0S",
          courseId: course.id,
        };
      })
    );

    await prisma.video.createMany({
      data: videoData,
      skipDuplicates: true,
    });

    const createdCourseWithVideos = await prisma.course.findUnique({
      where: { id: course.id },
      include: { videos: true },
    });

    return NextResponse.json(createdCourseWithVideos);
  } catch (_error) {
    // console.error("[COURSE_CREATE_WITH_PLAYLIST]", _error);
    if (_error instanceof Error && _error.message.includes("P2002")) {
      return new NextResponse(
        "A course with this playlist ID already exists.",
        { status: 409 }
      );
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
