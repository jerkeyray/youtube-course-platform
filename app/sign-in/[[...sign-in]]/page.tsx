import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import Link from "next/link";

export default async function SignInPage() {
  const session = await auth();

  // If user is already signed in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl opacity-50"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              yudoku
            </h1>
          </Link>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h2>
          <p className="text-lg text-gray-600">
            Sign in to continue your learning journey.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200/50">
          <SignInForm />
        </div>

        <p className="mt-8 px-8 text-center text-sm text-gray-500">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-blue-600 font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-blue-600 font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
