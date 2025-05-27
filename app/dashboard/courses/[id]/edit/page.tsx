import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditCourseForm } from "@/components/EditCourseForm";

interface EditCoursePageProps {
  params: {
    id: string;
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!course) {
    redirect("/dashboard");
  }

  return (
    <main className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Course</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <EditCourseForm course={course} />
      </div>
    </main>
  );
}
