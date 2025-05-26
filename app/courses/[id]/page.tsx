import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CoursePlayer from "./CoursePlayer";
import { CourseNotesWrapper } from "@/components/CourseNotesWrapper";

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: params.id,
      userId,
    },
    include: {
      videos: {
        include: {
          progress: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    redirect("/courses");
  }

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{course.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CoursePlayer course={course} />
        </div>
        <div>
          <CourseNotesWrapper courseId={course.id} />
        </div>
      </div>
    </main>
  );
}
