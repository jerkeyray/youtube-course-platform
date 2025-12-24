import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileData } from "@/lib/data/profile";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const profileData = await getProfileData(session.user.id);

  return <ProfileClient profileData={profileData} session={session} />;
}
