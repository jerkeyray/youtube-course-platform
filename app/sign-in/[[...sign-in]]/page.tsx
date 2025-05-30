import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  // If user is already signed in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to continue your learning journey
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            <form
              action={async () => {
                "use server";
                await auth();
                redirect("/api/auth/signin/google");
              }}
            >
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                  <path d="M17.2 12C17.2 12.6 16.7 13.1 16.1 13.1H12.8V16.5C12.8 17.1 12.3 17.6 11.7 17.6C11.1 17.6 10.6 17.1 10.6 16.5V13.1H7.3C6.7 13.1 6.2 12.6 6.2 12C6.2 11.4 6.7 10.9 7.3 10.9H10.6V7.5C10.6 6.9 11.1 6.4 11.7 6.4C12.3 6.4 12.8 6.9 12.8 7.5V10.9H16.1C16.7 10.9 17.2 11.4 17.2 12Z" />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
