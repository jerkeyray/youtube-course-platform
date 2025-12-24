import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateCourseClient from "./CreateCourseClient";

export default async function CreateCoursePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return <CreateCourseClient userId={session.user.id} />;
}
