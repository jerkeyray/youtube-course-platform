"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function SignUpForm() {
  return (
    <div className="grid gap-6">
      <Button
        variant="outline"
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 py-6 text-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md transform hover:scale-[1.02]"
      >
        <FcGoogle className="h-6 w-6" />
        <span className="font-medium text-gray-700">Sign up with Google</span>
      </Button>
    </div>
  );
}
