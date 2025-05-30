import { useSession } from "next-auth/react";

/**
 * Compatibility hook to replace Clerk's useAuth
 * This mimics the Clerk auth API shape while using Auth.js under the hood
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    isSignedIn: status === "authenticated",
    isLoaded: status !== "loading",
    userId: session?.user?.id || null,
    sessionId: session?.user?.id || null,
    user: session?.user
      ? {
          id: session.user.id,
          firstName: session.user.name?.split(" ")[0] || "",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          fullName: session.user.name || "",
          imageUrl: session.user.image || "",
          profileImageUrl: session.user.image || "",
          email: session.user.email || "",
          primaryEmailAddress: {
            emailAddress: session.user.email || "",
          },
        }
      : null,
  };
}
