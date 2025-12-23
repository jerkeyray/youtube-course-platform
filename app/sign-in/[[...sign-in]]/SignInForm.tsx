"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full h-12 bg-white text-black hover:bg-neutral-200 transition-colors rounded-md font-medium text-sm flex items-center justify-center gap-2.5"
      >
        <FcGoogle className="h-5 w-5" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}
