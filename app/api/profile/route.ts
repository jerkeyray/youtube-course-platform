import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("Auth userId:", userId);

    if (!userId) {
      console.log("No userId found in auth");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: {
          include: {
            videos: {
              include: {
                progress: {
                  where: { userId },
                },
              },
            },
          },
        },
        activities: true,
        certificates: {
          include: {
            course: true,
          },
        },
      },
    });

    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      // If user doesn't exist in our database, create them
      const clerkUser = await auth();
      if (!clerkUser.userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const newUser = await prisma.user.create({
        data: {
          id: clerkUser.userId,
          email: clerkUser.sessionClaims?.email as string,
          name: clerkUser.sessionClaims?.name as string,
          image: clerkUser.sessionClaims?.picture as string,
        },
      });

      return NextResponse.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        createdAt: newUser.createdAt,
        completedCourses: [],
      });
    }

    // Get completed courses
    const completedCourses = user.courses.filter((course) => {
      const totalVideos = course.videos.length;
      const completedVideos = course.videos.filter((video) =>
        video.progress.some((p) => p.completed)
      ).length;
      return completedVideos === totalVideos && totalVideos > 0;
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      completedCourses: completedCourses.map((course) => ({
        id: course.id,
        title: course.title,
        completedAt: course.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[PROFILE_GET] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { bio } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: bio, // Using name field for bio since we don't have a bio field
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_PATCH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
