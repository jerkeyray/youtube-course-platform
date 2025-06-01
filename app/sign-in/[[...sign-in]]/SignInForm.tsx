"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc"; // Google icon

export default function SignInForm() {
  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 h-12 text-sm font-medium border border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 hover:text-black transition-colors duration-200 rounded-lg"
      >
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Secure authentication
          </span>
        </div>
      </div>
    </div>
  );
}
