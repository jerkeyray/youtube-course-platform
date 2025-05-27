import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import UserMenu from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold" aria-label="Yuco Home">
          Yukoda
        </Link>
        <div className="flex items-center gap-4">
          {userId && (
            <div className="hidden md:flex gap-4">
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
            </div>
          )}
          {userId ? (
            <UserMenu />
          ) : (
            <Button asChild variant="outline">
              <Link href="/sign-in">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
