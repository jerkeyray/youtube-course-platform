import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeLayoutClient from "./layout-client";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <HomeLayoutClient session={session}>{children}</HomeLayoutClient>;
}
