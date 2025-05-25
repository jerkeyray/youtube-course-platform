import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Twitter, Google],
});