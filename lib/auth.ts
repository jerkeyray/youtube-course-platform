import { PrismaAdapter } from "@auth/prisma-adapter";
import { type AuthConfig } from "@auth/core";
import GoogleProvider from "@auth/core/providers/google";
import { prisma } from "@/lib/prisma";

// Check if running in an edge runtime
const isEdge =
  typeof process.env.NEXT_RUNTIME === "string" &&
  process.env.NEXT_RUNTIME === "edge";

export const authOptions: AuthConfig = {
  // Only use PrismaAdapter in Node.js environment, not in Edge runtime
  adapter: isEdge ? undefined : PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  // Ensure cookies work properly in all environments
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
