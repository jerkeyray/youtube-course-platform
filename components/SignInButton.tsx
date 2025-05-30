"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface SignInButtonProps {
  provider: {
    id: string;
    name: string;
  };
}

export function SignInButton({ provider }: SignInButtonProps) {
  return (
    <Button
      onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm normal-case"
    >
      {provider.id === "google" && <FcGoogle className="mr-2 h-5 w-5" />}
      Sign in with {provider.name}
    </Button>
  );
}
