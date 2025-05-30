import NextAuth, { DefaultSession, User, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//   throw new Error(
//     "Google OAuth credentials are missing. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
//   );
// }

// Check if running in an edge runtime
const isEdge =
  typeof process.env.NEXT_RUNTIME === "string" &&
  process.env.NEXT_RUNTIME === "edge";

interface ExtendedUser extends User {
  id: string;
}

interface ExtendedSession extends DefaultSession {
  user?: ExtendedUser & DefaultSession["user"];
}

interface ExtendedToken extends JWT {
  id?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isEdge ? undefined : PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: ExtendedToken;
    }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub; // token.sub is the user id from JWT
      }
      return session;
    },
    jwt: ({
      token,
      user,
    }: {
      token: ExtendedToken;
      user?: ExtendedUser | Account | Profile;
    }) => {
      if (user && "id" in user) {
        // Check if user object has id (for User type)
        token.id = user.id;
      }
      return token;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/sign-in", // Error code passed in query string as ?error=
  },
});
