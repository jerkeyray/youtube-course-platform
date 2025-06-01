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
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Elements - matching landing page */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              yudoku
            </h1>
          </Link>
        </div>

        <div className="max-w-md relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Transform your YouTube learning experience
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Organize, track, and enhance your learning journey with powerful
            tools designed for YouTube courses.
          </p>
        </div>

        <div className="text-sm text-gray-500 relative z-10">
          Focus on what matters most - your learning
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                yudoku
              </h1>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
