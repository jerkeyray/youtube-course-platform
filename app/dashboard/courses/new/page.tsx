import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewCourseForm } from "@/components/NewCourseForm";

export default async function NewCoursePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Course</h1>
      <div className="mx-auto max-w-2xl">
        <NewCourseForm />
      </div>
    </main>
  );
}
