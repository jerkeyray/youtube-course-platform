import { User } from "@clerk/nextjs/server";
import Image from "next/image";

interface UserProfileDetailsProps {
  user: User;
}

export function UserProfileDetails({ user }: UserProfileDetailsProps) {
  return (
    <div className="flex items-center gap-6 rounded-lg border bg-card p-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-full">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName ?? "Profile"}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-2xl text-primary-foreground">
            {user.fullName?.charAt(0) ?? "U"}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold">{user.fullName}</h2>
        <p className="text-muted-foreground">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}
