import { auth as getAuth } from "@/auth";

/**
 * Utility function to maintain compatibility with Clerk auth's API shape
 * while using Auth.js under the hood
 */
export async function auth() {
  const session = await getAuth();

  // Create a similar API shape to Clerk's auth() function
  return {
    userId: session?.user?.id || null,
    sessionId: session?.user?.id || null,
    getToken: async () => session?.user?.id || null,
  };
}

/**
 * Replacement for Clerk's currentUser
 * Returns user information in a format compatible with Clerk
 */
export async function currentUser() {
  const session = await getAuth();

  if (!session?.user) {
    return null;
  }

  // Map Auth.js user to a Clerk-compatible format
  return {
    id: session.user.id,
    firstName: session.user.name?.split(" ")[0] || "",
    lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
    imageUrl: session.user.image || "",
    email: session.user.email || "",
    fullName: session.user.name || "",
    primaryEmailAddress: {
      emailAddress: session.user.email || "",
    },
  };
}
